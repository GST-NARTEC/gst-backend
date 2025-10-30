import ejs from "ejs";
import fs from "fs-extra";
import path, { dirname } from "path";
import { chromium } from "playwright";
import { fileURLToPath } from "url";

import { calculatePrice } from "./priceCalculator.js";
import prisma from "./prismaClient.js";
import generateZatcaQrCodeForInvoice from "./zatcaQrGenerator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Add logo path configuration
const LOGO_PATH = "/assets/images/gst-logo.png";
const DOMAIN = process.env.DOMAIN || "http://localhost:3000";
const LOGO_URL = `${DOMAIN}${LOGO_PATH}`;

// Base Playwright launch options with improved stability
const getPlaywrightLaunchOptions = () => ({
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-web-security",
    "--disable-features=IsolateOrigins,site-per-process",
    "--single-process",
    "--no-zygote",
    "--disable-accelerated-2d-canvas",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-breakpad",
    "--disable-component-extensions-with-background-pages",
    "--disable-extensions",
    "--disable-features=TranslateUI,BlinkGenPropertyTrees",
    "--disable-ipc-flooding-protection",
    "--disable-renderer-backgrounding",
    "--enable-features=NetworkService,NetworkServiceInProcess",
    "--force-color-profile=srgb",
    "--hide-scrollbars",
    "--metrics-recording-only",
    "--mute-audio",
  ],
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  timeout: 120000, // 2 minutes
});

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
          date: invoice?.createdAt
            ? new Date(invoice.createdAt).toLocaleString()
            : new Date().toLocaleString(),
          number: invoice?.invoiceNumber || "N/A",
          type: order.paymentType,
          customer: user.companyNameEn + " / " + user.companyNameAr,
        },
        currency: {
          name: currency.name,
          symbol: currency.symbol,
        },
        order: {
          orderItems: order.orderItems.map((item) => ({
            product: {
              title: item.product.title,
            },
            quantity: item.quantity,
            price: item.price,
            addonItems:
              item.addonItems?.map((addonItem) => ({
                addon: {
                  name: addonItem.addon.name,
                },
                quantity: addonItem.quantity,
                price: addonItem.price,
                total: (addonItem.price * addonItem.quantity).toFixed(2),
              })) || [],
            itemTotal: (item.price * item.quantity).toFixed(2),
            addonsTotal: item.addonItems
              ? item.addonItems
                  .reduce(
                    (sum, addonItem) =>
                      sum + addonItem.price * addonItem.quantity,
                    0
                  )
                  .toFixed(2)
              : "0.00",
          })),
        },
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
          id: "312408381800003" ?? activeVat.taxId,
          name: activeVat.name,
        },
        calculatePrice,
      };

      //   // Generate QR code and render template (existing code)
      //   const qrCodeDataUrl = await QRCode.toDataURL(invoice.invoiceNumber);
      //   data.qrCode = qrCodeDataUrl;

      console.log("Data for PDF generation:", data);

      // Generate the ZATCA QR code
      const qrCodeDataUrl = await generateZatcaQrCodeForInvoice(
        invoice,
        user,
        data
      );
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

      let browser = null;
      let page = null;

      try {
        browser = await chromium.launch(getPlaywrightLaunchOptions());

        page = await browser.newPage();

        // Set a shorter timeout for content loading
        page.setDefaultNavigationTimeout(60000); // 1 minute
        page.setDefaultTimeout(60000);

        // Set content with a more reliable wait strategy
        await page.setContent(htmlContent, {
          waitUntil: "networkidle",
          timeout: 60000,
        });

        // Generate PDF with timeout
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

        return {
          absolutePath: pdfPath,
          relativePath: relativePath,
        };
      } finally {
        // Ensure cleanup happens even if there's an error
        try {
          if (page) {
            await page
              .close()
              .catch((e) => console.error("Error closing page:", e));
          }
          if (browser) {
            await browser
              .close()
              .catch((e) => console.error("Error closing browser:", e));
          }
        } catch (cleanupError) {
          console.error("Error during cleanup:", cleanupError);
        }
      }
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

  static async generateLicenseCertificate(data) {
    try {
      const templatePath = path.join(
        __dirname,
        "../view/licenseCertificate.ejs"
      );
      const templateContent = await fs.readFile(templatePath, "utf-8");

      // Render the template
      const html = ejs.render(templateContent, {
        licensedTo: data.licensedTo,
        licensee: data.licensee,
        gtins: data.gtins,
        issueDate: data.issueDate,
        memberId: data.memberId,
        email: data.email,
        phone: data.phone,
        logo: LOGO_URL,
        calculatePrice,
      });

      // Create directory if it doesn't exist
      const dir = path.join(__dirname, "../uploads/certificates");
      await fs.mkdir(dir, { recursive: true });

      // Generate unique filename
      const filename = `certificate-${Date.now()}.pdf`;
      const absolutePath = path.join(dir, filename);
      const relativePath = `uploads/certificates/${filename}`;

      let browser = null;
      let page = null;

      try {
        // Generate PDF
        browser = await chromium.launch(getPlaywrightLaunchOptions());
        page = await browser.newPage();

        page.setDefaultNavigationTimeout(60000);
        page.setDefaultTimeout(60000);

        await page.setContent(html, {
          waitUntil: "networkidle",
          timeout: 60000,
        });

        // Generate PDF
        await page.pdf({
          path: absolutePath,
          format: "A4",
          printBackground: true,
          margin: {
            top: "20px",
            right: "20px",
            bottom: "20px",
            left: "20px",
          },
        });

        return {
          absolutePath,
          relativePath,
        };
      } finally {
        // Ensure cleanup
        try {
          if (page)
            await page
              .close()
              .catch((e) => console.error("Error closing page:", e));
          if (browser)
            await browser
              .close()
              .catch((e) => console.error("Error closing browser:", e));
        } catch (cleanupError) {
          console.error("Error during cleanup:", cleanupError);
        }
      }
    } catch (error) {
      console.error("Error generating license certificate:", error);
      throw error;
    }
  }

  static async generateBarcodeCertificate(data) {
    try {
      const templatePath = path.join(
        __dirname,
        "../view/barcodeCertificate.ejs"
      );
      const templateContent = await fs.readFile(templatePath, "utf-8");

      // Format the date if it's not already formatted
      const formattedDate =
        data.issueDate instanceof Date
          ? data.issueDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : data.issueDate;

      // Render the template with all required data
      const html = ejs.render(templateContent, {
        licensedTo: data.licensedTo,
        gtin: data.gtin, // Added GTIN
        issueDate: formattedDate,
        memberId: data.memberId,
        email: data.email,
        phone: data.phone,
        barcodeType: data.barcodeType,
        logo: LOGO_URL,
      });

      // Create directory if it doesn't exist
      const dir = path.join(__dirname, "../uploads/barcodes");
      await fs.mkdir(dir, { recursive: true });

      // Generate unique filename using GTIN
      const filename = `barcode-certificate-${data.gtin}.pdf`;
      const absolutePath = path.join(dir, filename);
      const relativePath = `uploads/barcodes/${filename}`;

      let browser = null;
      let page = null;

      try {
        // Generate PDF
        browser = await chromium.launch(getPlaywrightLaunchOptions());
        page = await browser.newPage();

        page.setDefaultNavigationTimeout(60000);
        page.setDefaultTimeout(60000);

        await page.setContent(html, {
          waitUntil: "networkidle",
          timeout: 60000,
        });

        // Generate PDF
        await page.pdf({
          path: absolutePath,
          format: "A4",
          printBackground: true,
          margin: {
            top: "20px",
            right: "20px",
            bottom: "20px",
            left: "20px",
          },
        });

        return {
          absolutePath,
          relativePath,
        };
      } finally {
        // Ensure cleanup
        try {
          if (page)
            await page
              .close()
              .catch((e) => console.error("Error closing page:", e));
          if (browser)
            await browser
              .close()
              .catch((e) => console.error("Error closing browser:", e));
        } catch (cleanupError) {
          console.error("Error during cleanup:", cleanupError);
        }
      }
    } catch (error) {
      console.error("Error generating barcode certificate:", error);
      throw error;
    }
  }
}

export default PDFGenerator;
