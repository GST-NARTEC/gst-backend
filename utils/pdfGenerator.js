import ejs from "ejs";
import fs from "fs-extra";
import path, { dirname } from "path";
import puppeteer from "puppeteer";
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

// Base Puppeteer launch options with memory optimizations
const getPuppeteerLaunchOptions = (userDataDir) => ({
  headless: "new",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-web-security",
    "--disable-features=IsolateOrigins,site-per-process",
    "--disable-software-rasterizer",
    "--disable-extensions",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--single-process", // Critical for Windows stability
    "--no-zygote", // Helps with Windows compatibility
    "--disable-accelerated-2d-canvas",
    "--disable-dev-shm-usage", // Prevents shared memory issues
  ],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  userDataDir,
  timeout: 60000, // Increase timeout to 60 seconds
  protocolTimeout: 60000, // Add protocol timeout
});

// Helper function to safely close browser
const safeBrowserClose = async (browser) => {
  if (browser) {
    try {
      const pages = await browser.pages();
      await Promise.all(pages.map((page) => page.close().catch(() => {})));
      await browser.close();
    } catch (error) {
      console.error("Error closing browser:", error);
      try {
        // Force kill if normal close fails
        if (browser.process()) {
          browser.process().kill("SIGKILL");
        }
      } catch (killError) {
        console.error("Error force killing browser:", killError);
      }
    }
  }
};

class PDFGenerator {
  static async generateDocument(order, user, invoice, type = "invoice") {
    let browser;
    const maxRetries = 2;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(
            `PDF generation retry attempt ${attempt} of ${maxRetries}`
          );
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        }

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

        // Create a temporary directory for Puppeteer user data
        const tempDir = path.join(
          __dirname,
          "../uploads/temp/puppeteer-profile"
        );
        await fs.ensureDir(tempDir);

        browser = await puppeteer.launch(getPuppeteerLaunchOptions(tempDir));

        const page = await browser.newPage();

        // Set timeouts for the page
        page.setDefaultTimeout(60000);
        page.setDefaultNavigationTimeout(60000);

        await page.setContent(htmlContent, {
          waitUntil: "networkidle0",
          timeout: 60000,
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
          timeout: 60000,
        });

        await safeBrowserClose(browser);
        browser = null;

        return {
          absolutePath: pdfPath,
          relativePath: relativePath,
        };
      } catch (error) {
        lastError = error;
        console.error(
          `Error generating ${type} (attempt ${attempt + 1}):`,
          error
        );

        // Clean up browser on error
        if (browser) {
          await safeBrowserClose(browser);
          browser = null;
        }

        // If it's the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error;
        }
        // Otherwise, continue to next retry
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error("PDF generation failed after all retries");
  }

  // Convenience methods
  static generateInvoice(order, user, invoice) {
    return this.generateDocument(order, user, invoice, "invoice");
  }

  static generateReceipt(order, user, invoice) {
    return this.generateDocument(order, user, invoice, "receipt");
  }

  static async generateLicenseCertificate(data) {
    let browser;
    const maxRetries = 2;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(
            `License PDF generation retry attempt ${attempt} of ${maxRetries}`
          );
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        }

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

        // Create a temporary directory for Puppeteer user data
        const tempDir = path.join(
          __dirname,
          "../uploads/temp/puppeteer-profile-license"
        );
        await fs.ensureDir(tempDir);

        // Generate PDF
        browser = await puppeteer.launch(getPuppeteerLaunchOptions(tempDir));

        const page = await browser.newPage();
        page.setDefaultTimeout(60000);
        page.setDefaultNavigationTimeout(60000);

        await page.setContent(html, { timeout: 60000 });

        // Create directory if it doesn't exist
        const dir = path.join(__dirname, "../uploads/certificates");
        await fs.mkdir(dir, { recursive: true });

        // Generate unique filename
        const filename = `certificate-${Date.now()}.pdf`;
        const absolutePath = path.join(dir, filename);
        const relativePath = `uploads/certificates/${filename}`;

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
          timeout: 60000,
        });

        await safeBrowserClose(browser);
        browser = null;

        return {
          absolutePath,
          relativePath,
        };
      } catch (error) {
        lastError = error;
        console.error(
          `Error generating license certificate (attempt ${attempt + 1}):`,
          error
        );

        if (browser) {
          await safeBrowserClose(browser);
          browser = null;
        }

        if (attempt === maxRetries) {
          throw error;
        }
      }
    }

    throw (
      lastError ||
      new Error("License certificate generation failed after all retries")
    );
  }

  static async generateBarcodeCertificate(data) {
    let browser;
    const maxRetries = 2;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(
            `Barcode PDF generation retry attempt ${attempt} of ${maxRetries}`
          );
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        }

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

        // Create a temporary directory for Puppeteer user data
        const tempDir = path.join(
          __dirname,
          "../uploads/temp/puppeteer-profile-barcode"
        );
        await fs.ensureDir(tempDir);

        // Generate PDF
        browser = await puppeteer.launch(getPuppeteerLaunchOptions(tempDir));

        const page = await browser.newPage();
        page.setDefaultTimeout(60000);
        page.setDefaultNavigationTimeout(60000);

        await page.setContent(html, { timeout: 60000 });

        // Create directory if it doesn't exist
        const dir = path.join(__dirname, "../uploads/barcodes");
        await fs.mkdir(dir, { recursive: true });

        // Generate unique filename using GTIN
        const filename = `barcode-certificate-${data.gtin}.pdf`;
        const absolutePath = path.join(dir, filename);
        const relativePath = `uploads/barcodes/${filename}`;

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
          timeout: 60000,
        });

        await safeBrowserClose(browser);
        browser = null;

        return {
          absolutePath,
          relativePath,
        };
      } catch (error) {
        lastError = error;
        console.error(
          `Error generating barcode certificate (attempt ${attempt + 1}):`,
          error
        );

        if (browser) {
          await safeBrowserClose(browser);
          browser = null;
        }

        if (attempt === maxRetries) {
          throw error;
        }
      }
    }

    throw (
      lastError ||
      new Error("Barcode certificate generation failed after all retries")
    );
  }
}

export default PDFGenerator;
