import ejs from "ejs";
import fs from "fs-extra";
import path, { dirname } from "path";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import { fileURLToPath } from "url";

import prisma from "./prismaClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Add logo path configuration
const LOGO_PATH = "/assets/images/gst-logo.png";
const DOMAIN = process.env.DOMAIN || "http://localhost:3000";
const LOGO_URL = `${DOMAIN}${LOGO_PATH}`;

class PDFGenerator {
  static async generateDocument(order, user, invoice, type = "invoice") {
    try {
      const templatePath = path.join(__dirname, "../view/invoice.ejs");
      const templateContent = await fs.readFile(templatePath, "utf-8");

      // Get VAT and currency data (existing code)
      const activeVat = await prisma.vat.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });

      if (!activeVat) {
        throw new MyError("No active VAT configuration found", 400);
      }

      const currency = await prisma.currency.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (!currency) {
        throw new MyError("No currency configuration found", 400);
      }

      const data = {
        logo: LOGO_URL,
        documentType: type.toUpperCase(), // This will be used in the template
        invoice: {
          date: new Date(invoice.createdAt).toLocaleString(),
          number: invoice.invoiceNumber,
          type: order.paymentType,
          customer: user.companyNameEn + " / " + user.companyNameAr,
        },
        currency: {
          name: currency.name,
          symbol: currency.symbol,
        },
        items: order.orderItems.map((item) => ({
          description: item.product.title,
          quantity: item.quantity,
          amount: item.price.toFixed(2),
          addons: item.addons
            ? item.addons.map((addon) => ({
                name: addon.name,
                price: addon.price.toFixed(2),
              }))
            : [],
        })),
        totals: {
          subtotal: order.totalAmount.toFixed(2),
          vat: invoice.vat.toFixed(2),
          grandTotal: order.overallAmount.toFixed(2),
        },
        contact: {
          phone: user.mobile,
          email: user.email,
          address: user.streetAddress,
        },
        tax: {
          type: activeVat.type,
          value: activeVat.value,
          computed: invoice.vat.toFixed(2),
          id: activeVat.taxId,
          name: activeVat.name,
        },
      };

      // Generate QR code and render template (existing code)
      const qrCodeDataUrl = await QRCode.toDataURL(invoice.invoiceNumber);
      data.qrCode = qrCodeDataUrl;

      const htmlContent = await ejs.render(templateContent, data, {
        async: true,
      });

      // Generate PDF with appropriate filename
      const fileName = `${type}-${invoice.invoiceNumber}.pdf`;
      const pdfPath = path.join("uploads", "pdfs", fileName);
      const relativePath = path
        .join("uploads", "pdfs", fileName)
        .replace(/\\/g, "/");

      await fs.ensureDir(path.join("uploads", "pdfs"));

      const browser = await puppeteer.launch({
        headless: "new",
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, {
        waitUntil: "networkidle0",
      });

      await page.pdf({
        path: pdfPath,
        format: "A4",
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
        printBackground: true,
      });

      await browser.close();

      return {
        absolutePath: pdfPath,
        relativePath: relativePath,
      };
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      throw error;
    }
  }

  // Convenience methods
  static generateInvoice(order, user, invoice) {
    return this.generateDocument(order, user, invoice, "invoice");
  }

  static generateReceipt(order, user, invoice) {
    return this.generateDocument(order, user, invoice, "receipt");
  }
}

export default PDFGenerator;
