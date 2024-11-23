import ejs from "ejs";
import fs from "fs-extra";
import path, { dirname } from "path";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Add logo path configuration
const LOGO_PATH = "/assets/images/gst-logo.png";
const DOMAIN = process.env.DOMAIN || "http://localhost:3000";
const LOGO_URL = `${DOMAIN}${LOGO_PATH}`;

class PDFGenerator {
  static async generateInvoice(order, user, invoice) {
    try {
      // 1. First create the invoice HTML using EJS
      const templatePath = path.join(__dirname, "../view/invoice.ejs");
      const templateContent = await fs.readFile(templatePath, "utf-8");

      // 2. Prepare data for the template
      const activeVat = await prisma.vat.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });

      if (!activeVat) {
        throw new MyError("No active VAT configuration found", 400);
      }

      const data = {
        logo: LOGO_URL,
        invoice: {
          date: new Date(invoice.createdAt).toLocaleString(),
          number: invoice.invoiceNumber,
          type: order.paymentType,
          customer: user.companyNameEn,
        },
        items: order.orderItems.map((item) => ({
          description: item.product.title,
          quantity: item.quantity,
          amount: `AED ${item.price.toFixed(2)}`,
        })),
        totals: {
          subtotal: `AED ${order.totalAmount.toFixed(2)}`,
          vat: `AED ${invoice.vat.toFixed(2)}`,
          grandTotal: `AED ${order.overallAmount.toFixed(2)}`,
        },
        contact: {
          phone: user.mobile,
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

      // 3. Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(invoice.invoiceNumber);
      data.qrCode = qrCodeDataUrl;

      // 4. Render EJS template
      const htmlContent = await ejs.render(templateContent, data, {
        async: true,
      });

      // 5. Save HTML to temporary file
      const tempHtmlPath = path.join(
        "uploads",
        "temp",
        `invoice-${invoice.invoiceNumber}.html`
      );
      await fs.ensureDir(path.join("uploads", "temp"));
      await fs.writeFile(tempHtmlPath, htmlContent);

      // 6. Launch puppeteer and generate PDF
      const browser = await puppeteer.launch({
        headless: "new",
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, {
        waitUntil: "networkidle0",
      });

      const pdfFileName = `invoice-${invoice.invoiceNumber}.pdf`;
      const pdfPath = path.join("uploads", "pdfs", pdfFileName);
      const relativePath = path
        .join("uploads", "pdfs", pdfFileName)
        .replace(/\\/g, "/");

      await fs.ensureDir(path.join("uploads", "pdfs"));

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
      await fs.remove(tempHtmlPath);

      return {
        absolutePath: pdfPath,
        relativePath: relativePath,
      };
    } catch (error) {
      console.error("Error generating invoice:", error);
      throw error;
    }
  }
}

export default PDFGenerator;
