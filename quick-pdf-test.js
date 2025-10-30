/**
 * Simple PDF Generation Test
 *
 * A minimal test script to quickly verify PDF generation works
 * Run with: node quick-pdf-test.js
 */

import fs from "fs-extra";
import PDFGenerator from "./utils/pdfGenerator.js";

console.log("🧪 Quick PDF Generation Test\n");
console.log("=".repeat(50));

// Create mock data
const mockUser = {
  id: "test-user-123",
  email: "test@example.com",
  companyNameEn: "Test Company Ltd.",
  companyNameAr: "شركة اختبار المحدودة",
  mobile: "+966501234567",
  streetAddress: "123 Test Street, Riyadh, Saudi Arabia",
  companyLicenseNo: "1234567890",
};

const timestamp = Date.now();
const mockInvoice = {
  id: "test-invoice-123",
  invoiceNumber: `INV-TEST-${timestamp}`,
  createdAt: new Date(),
  totalAmount: 470,
  vat: 70.5,
  overallAmount: 540.5,
  status: "completed",
  paymentType: "Bank Transfer",
};

const mockOrder = {
  id: "test-order-123",
  userId: mockUser.id,
  paymentType: "Bank Transfer",
  totalAmount: 470,
  vat: 70.5,
  overallAmount: 540.5,
  status: "completed",
  orderNumber: `ORD-TEST-${timestamp}`,
  orderItems: [
    {
      id: "item-1",
      quantity: 10,
      price: 47,
      product: {
        id: "product-1",
        title: "GS1 Barcode License - 10 Units",
        description: "Standard GS1 barcode license",
        price: 47,
      },
      addonItems: [],
    },
  ],
};

console.log("📝 Mock Data Created:");
console.log(`   User: ${mockUser.companyNameEn}`);
console.log(`   Invoice: ${mockInvoice.invoiceNumber}`);
console.log(`   Order: ${mockOrder.orderNumber}`);
console.log(`   Total: ${mockOrder.overallAmount} SAR\n`);

console.log("🔨 Generating PDF...");

try {
  const result = await PDFGenerator.generateInvoice(
    mockOrder,
    mockUser,
    mockInvoice
  );

  console.log("✅ PDF Generated Successfully!\n");
  console.log("📄 PDF Details:");
  console.log(`   Path: ${result.relativePath}`);
  console.log(`   Full Path: ${result.absolutePath}`);

  // Check file
  const stats = await fs.stat(result.absolutePath);
  const fileSizeKB = (stats.size / 1024).toFixed(2);
  console.log(`   Size: ${fileSizeKB} KB`);

  if (stats.size > 10000) {
    console.log("\n✅ Test Passed! PDF looks good.");
    console.log(`\n💡 You can view the PDF at: ${result.absolutePath}`);
    process.exit(0);
  } else {
    console.log("\n⚠️  Warning: PDF file size seems too small.");
    process.exit(1);
  }
} catch (error) {
  console.error("\n❌ PDF Generation Failed!");
  console.error(`   Error: ${error.message}`);
  console.error("\n📋 Full Error:");
  console.error(error);
  process.exit(1);
}
