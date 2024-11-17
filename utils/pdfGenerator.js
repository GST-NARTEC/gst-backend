import ejs from "ejs";
import fs from "fs-extra";
import path, { dirname } from "path";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PDFGenerator {
  static async generateInvoice(order, user, invoice) {
    try {
      // 1. First create the invoice HTML using EJS
      const templatePath = path.join(__dirname, "../view/invoice.ejs");
      const templateContent = await fs.readFile(templatePath, "utf-8");

      // 2. Prepare data for the template
      const data = {
        logo: "https://gs1.org.sa/assets/gs1logowhite-QWHdyWZd.png",
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
          grandTotal: `AED ${order.overallAmount.toFixed(2)}`,
        },
        contact: {
          phone: user.mobile,
          address: user.streetAddress,
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

      // 7. Generate PDF
      const pdfPath = path.join(
        "uploads",
        "pdfs",
        `invoice-${invoice.invoiceNumber}.pdf`
      );
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

      // 8. Clean up temporary HTML file
      await fs.remove(tempHtmlPath);

      return pdfPath;
    } catch (error) {
      console.error("Error generating invoice:", error);
      throw error;
    }
  }
}

export default PDFGenerator;
