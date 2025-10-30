/**
 * PDF Generation Test Script
 *
 * This script tests the PDF generation functionality for invoices
 * Run with: node test-pdf-generation.js
 */

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import PDFGenerator from "./utils/pdfGenerator.js";
import prisma from "./utils/prismaClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for pretty output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n" + "=".repeat(60));
  log(title, "bright");
  console.log("=".repeat(60) + "\n");
}

function logSuccess(message) {
  log(`✓ ${message}`, "green");
}

function logError(message) {
  log(`✗ ${message}`, "red");
}

function logInfo(message) {
  log(`ℹ ${message}`, "cyan");
}

function logWarning(message) {
  log(`⚠ ${message}`, "yellow");
}

// Mock data generator
function generateMockData() {
  const timestamp = Date.now();

  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    companyNameEn: "Test Company Ltd.",
    companyNameAr: "شركة اختبار المحدودة",
    mobile: "+966501234567",
    streetAddress: "123 Test Street, Test City, Saudi Arabia",
    companyLicenseNo: "1234567890",
    country: "Saudi Arabia",
    city: "Riyadh",
    zipCode: "12345",
  };

  const mockInvoice = {
    id: "test-invoice-id",
    invoiceNumber: `INV-TEST-${timestamp}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    totalAmount: 1000,
    vat: 150,
    overallAmount: 1150,
    status: "completed",
    paymentType: "Bank Transfer",
    orderId: "test-order-id",
    userId: mockUser.id,
  };

  const mockOrder = {
    id: "test-order-id",
    userId: mockUser.id,
    paymentType: "Bank Transfer",
    totalAmount: 1000,
    vat: 150,
    overallAmount: 1150,
    status: "completed",
    orderNumber: `ORD-TEST-${timestamp}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    orderItems: [
      {
        id: "item-1",
        quantity: 10,
        price: 47,
        product: {
          id: "product-1",
          title: "GS1 Barcode License - 10 Units",
          description: "Standard GS1 barcode license package",
          price: 47,
        },
        addonItems: [
          {
            id: "addon-item-1",
            quantity: 2,
            price: 50,
            addon: {
              id: "addon-1",
              name: "Express Processing",
              price: 50,
            },
          },
          {
            id: "addon-item-2",
            quantity: 1,
            price: 100,
            addon: {
              id: "addon-2",
              name: "Priority Support",
              price: 100,
            },
          },
        ],
      },
      {
        id: "item-2",
        quantity: 5,
        price: 94,
        product: {
          id: "product-2",
          title: "Additional Barcode Package - 5 Units",
          description: "Extra barcode licenses",
          price: 94,
        },
        addonItems: [],
      },
    ],
  };

  return { mockUser, mockInvoice, mockOrder };
}

// Test 1: Check if required files exist
async function testRequiredFiles() {
  logSection("TEST 1: Checking Required Files");

  const requiredFiles = [
    { path: "./view/invoice.ejs", description: "Invoice template" },
    { path: "./utils/pdfGenerator.js", description: "PDF Generator utility" },
    { path: "./utils/zatcaQrGenerator.js", description: "ZATCA QR Generator" },
    { path: "./utils/priceCalculator.js", description: "Price Calculator" },
    { path: "./assets/images/gst-logo.png", description: "Company logo" },
  ];

  let allFilesExist = true;

  for (const file of requiredFiles) {
    const fullPath = path.join(__dirname, file.path);
    if (await fs.pathExists(fullPath)) {
      logSuccess(`${file.description} found: ${file.path}`);
    } else {
      logError(`${file.description} NOT found: ${file.path}`);
      allFilesExist = false;
    }
  }

  return allFilesExist;
}

// Test 2: Check if uploads directory is writable
async function testUploadDirectory() {
  logSection("TEST 2: Checking Upload Directory");

  const uploadsDir = path.join(__dirname, "uploads/pdfs");

  try {
    await fs.ensureDir(uploadsDir);
    logSuccess(`Uploads directory created/verified: ${uploadsDir}`);

    // Test write permissions
    const testFile = path.join(uploadsDir, ".test-write");
    await fs.writeFile(testFile, "test");
    await fs.remove(testFile);
    logSuccess("Upload directory is writable");

    return true;
  } catch (error) {
    logError(`Upload directory test failed: ${error.message}`);
    return false;
  }
}

// Test 3: Check database connection (if needed)
async function testDatabaseConnection() {
  logSection("TEST 3: Checking Database Connection");

  try {
    // Try to fetch VAT and Currency from database
    const [vat, currency] = await Promise.all([
      prisma.vat.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.currency.findFirst({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (vat) {
      logSuccess(`Active VAT found: ${vat.value}% (${vat.type})`);
    } else {
      logWarning("No active VAT configuration found - will use mock data");
    }

    if (currency) {
      logSuccess(`Currency found: ${currency.name} (${currency.symbol})`);
    } else {
      logWarning("No currency configuration found - will use mock data");
    }

    return { vat, currency };
  } catch (error) {
    logWarning(`Database connection test skipped: ${error.message}`);
    return { vat: null, currency: null };
  }
}

// Test 4: Generate test PDF with mock data
async function testPDFGeneration() {
  logSection("TEST 4: Generating Test PDF with Mock Data");

  const { mockUser, mockInvoice, mockOrder } = generateMockData();

  logInfo("Using mock data:");
  console.log(JSON.stringify({ mockUser, mockInvoice, mockOrder }, null, 2));

  try {
    logInfo("\nGenerating PDF...");
    const result = await PDFGenerator.generateInvoice(
      mockOrder,
      mockUser,
      mockInvoice
    );

    logSuccess(`PDF generated successfully!`);
    logInfo(`Absolute path: ${result.absolutePath}`);
    logInfo(`Relative path: ${result.relativePath}`);

    // Check if file exists
    const fileExists = await fs.pathExists(result.absolutePath);
    if (fileExists) {
      const stats = await fs.stat(result.absolutePath);
      logSuccess(`PDF file exists (${(stats.size / 1024).toFixed(2)} KB)`);

      // Check if file size is reasonable (should be > 10KB for a proper PDF)
      if (stats.size > 10000) {
        logSuccess("PDF file size looks good");
      } else {
        logWarning("PDF file size seems too small - might be corrupted");
      }
    } else {
      logError("PDF file was not created!");
      return false;
    }

    return result;
  } catch (error) {
    logError(`PDF generation failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

// Test 5: Generate test PDF with real order (if order ID provided)
async function testPDFWithRealOrder(orderId) {
  logSection("TEST 5: Generating PDF with Real Order Data");

  if (!orderId) {
    logWarning("No order ID provided - skipping real order test");
    logInfo(
      "To test with real order, run: node test-pdf-generation.js <orderId>"
    );
    return true;
  }

  try {
    logInfo(`Fetching order: ${orderId}`);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        invoice: true,
        orderItems: {
          include: {
            product: true,
            addonItems: {
              include: {
                addon: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      logError(`Order not found: ${orderId}`);
      return false;
    }

    logSuccess(`Order found: ${order.orderNumber || orderId}`);

    if (!order.invoice) {
      logError("Order has no invoice - cannot generate PDF");
      return false;
    }

    logInfo("Generating PDF for real order...");
    const result = await PDFGenerator.generateInvoice(
      order,
      order.user,
      order.invoice
    );

    logSuccess("PDF generated successfully!");
    logInfo(`Absolute path: ${result.absolutePath}`);
    logInfo(`Relative path: ${result.relativePath}`);

    return result;
  } catch (error) {
    logError(`Real order PDF generation failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

// Test 6: Verify invoice template structure
async function testTemplateStructure() {
  logSection("TEST 6: Verifying Invoice Template Structure");

  try {
    const templatePath = path.join(__dirname, "view/invoice.ejs");
    const templateContent = await fs.readFile(templatePath, "utf-8");

    // Check for essential template elements
    const essentialElements = [
      { pattern: /logo/i, name: "Logo reference" },
      { pattern: /invoice/i, name: "Invoice data" },
      { pattern: /orderItems/i, name: "Order items loop" },
      { pattern: /qrCode/i, name: "QR code" },
      { pattern: /vat|tax/i, name: "VAT/Tax information" },
      { pattern: /total/i, name: "Total calculations" },
    ];

    let allElementsFound = true;

    for (const element of essentialElements) {
      if (element.pattern.test(templateContent)) {
        logSuccess(`${element.name} found in template`);
      } else {
        logWarning(`${element.name} might be missing from template`);
        allElementsFound = false;
      }
    }

    return allElementsFound;
  } catch (error) {
    logError(`Template structure test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  logSection("PDF GENERATION TEST SUITE");
  log("Testing invoice PDF generation functionality\n", "bright");

  const results = {
    filesExist: false,
    uploadDirWritable: false,
    databaseConnected: false,
    mockPDFGenerated: false,
    realPDFGenerated: false,
    templateValid: false,
  };

  try {
    // Run all tests
    results.filesExist = await testRequiredFiles();
    results.uploadDirWritable = await testUploadDirectory();

    const dbResult = await testDatabaseConnection();
    results.databaseConnected = !!(dbResult.vat && dbResult.currency);

    results.templateValid = await testTemplateStructure();

    // Only run PDF generation if previous tests passed
    if (results.filesExist && results.uploadDirWritable) {
      results.mockPDFGenerated = !!(await testPDFGeneration());

      // Check if order ID is provided as command line argument
      const orderId = process.argv[2];
      if (orderId) {
        results.realPDFGenerated = !!(await testPDFWithRealOrder(orderId));
      }
    } else {
      logWarning("\nSkipping PDF generation tests due to previous failures");
    }

    // Summary
    logSection("TEST SUMMARY");

    const testResults = [
      { name: "Required files exist", passed: results.filesExist },
      { name: "Upload directory writable", passed: results.uploadDirWritable },
      {
        name: "Database connection",
        passed: results.databaseConnected,
        optional: true,
      },
      { name: "Template structure valid", passed: results.templateValid },
      { name: "Mock PDF generation", passed: results.mockPDFGenerated },
      {
        name: "Real order PDF generation",
        passed: results.realPDFGenerated,
        optional: true,
      },
    ];

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    testResults.forEach((test) => {
      if (!test.optional) {
        totalTests++;
        if (test.passed) {
          passedTests++;
          logSuccess(`${test.name}: PASSED`);
        } else {
          failedTests++;
          logError(`${test.name}: FAILED`);
        }
      } else if (test.passed) {
        logSuccess(`${test.name}: PASSED (optional)`);
      } else {
        logWarning(`${test.name}: SKIPPED (optional)`);
      }
    });

    console.log("\n" + "=".repeat(60));
    log(`\nTotal Tests: ${totalTests}`, "bright");
    log(`Passed: ${passedTests}`, "green");
    log(`Failed: ${failedTests}`, "red");

    if (failedTests === 0) {
      log(
        "\n✓ All tests passed! PDF generation is working correctly.",
        "green"
      );
    } else {
      log(
        `\n✗ ${failedTests} test(s) failed. Please check the errors above.`,
        "red"
      );
    }

    console.log("=".repeat(60) + "\n");

    // Return exit code
    return failedTests === 0 ? 0 : 1;
  } catch (error) {
    logError(`\nTest suite failed with error: ${error.message}`);
    console.error(error);
    return 1;
  } finally {
    // Close database connection
    await prisma.$disconnect();
  }
}

// Run the tests
runTests()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
