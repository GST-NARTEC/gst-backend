/**
 * Manual GTIN Assignment Script
 *
 * This script assigns unassigned GTINs (status='Sold' but not in AssignedGtin table)
 * to a specific order and generates all required documents:
 * - Receipt PDF
 * - License Certificate PDF
 * - Individual Barcode Certificate PDFs for each assigned GTIN
 *
 * Usage: node scripts/manualGtinAssignment.js
 */

import path from "path";
import { fileURLToPath } from "url";

import { addDomain } from "../utils/file.js";
import PDFGenerator from "../utils/pdfGenerator.js";
import prisma from "../utils/prismaClient.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION - Update these values as needed
// ============================================================================
const ORDER_ID = "B08F9694-DF09-4FFD-AF25-408C498BD0FC";
const SKIP_EMAIL = false; // Set to false if you want to send activation email

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log("Manual GTIN Assignment Script");
  console.log("=".repeat(60));
  console.log(`Order ID: ${ORDER_ID}`);
  console.log(`Skip Email: ${SKIP_EMAIL}`);
  console.log("");

  try {
    // Step 1: Fetch the order with all necessary includes
    console.log("Step 1: Fetching order...");
    const order = await prisma.order.findUnique({
      where: { id: ORDER_ID },
      include: {
        user: true,
        invoice: true,
        orderItems: {
          include: {
            product: {
              include: {
                barcodeType: true,
              },
            },
            addonItems: {
              include: {
                addon: true,
              },
            },
          },
        },
        assignedGtins: true,
      },
    });

    if (!order) {
      throw new Error(`Order with ID ${ORDER_ID} not found`);
    }

    console.log(`✓ Order found: ${order.orderNumber}`);
    console.log(`  - User: ${order.user.companyNameEn}`);
    console.log(`  - Status: ${order.status}`);
    console.log(`  - Current assigned GTINs: ${order.assignedGtins.length}`);
    console.log("");

    // Step 2: Find unassigned GTINs (status='Sold' but not in AssignedGtin table)
    console.log("Step 2: Finding unassigned GTINs with status='Sold'...");
    const unassignedGtins = await prisma.$queryRaw`
      SELECT * FROM GTIN 
      WHERE status = 'Sold' 
      AND id NOT IN (SELECT gtinId FROM AssignedGtin)
    `;

    if (unassignedGtins.length === 0) {
      console.log("✓ No unassigned GTINs found with status='Sold'. Nothing to do.");
      await prisma.$disconnect();
      return;
    }

    console.log(`✓ Found ${unassignedGtins.length} unassigned GTINs with status='Sold'`);
    unassignedGtins.forEach((gtin, idx) => {
      console.log(`  ${idx + 1}. ${gtin.gtin} (ID: ${gtin.id})`);
    });
    console.log("");

    // Step 3: Create AssignedGtin records in a transaction
    console.log("Step 3: Creating AssignedGtin records...");
    const gtinAssignments = await prisma.$transaction(async (tx) => {
      const assignments = [];

      for (const gtin of unassignedGtins) {
        // Get barcodeTypeId from order items if available
        const orderItem = order.orderItems[0];
        const barcodeTypeId = orderItem?.product?.barcodeTypeId || null;

        const assignment = await tx.assignedGtin.create({
          data: {
            orderId: ORDER_ID,
            gtinId: gtin.id,
            barcodeTypeId: barcodeTypeId,
          },
        });

        assignments.push({
          ...assignment,
          gtin: gtin,
        });
      }

      return assignments;
    });

    console.log(`✓ Created ${gtinAssignments.length} AssignedGtin records`);
    console.log("");

    // Step 4: Generate Receipt PDF
    console.log("Step 4: Generating Receipt PDF...");
    const receipt = await PDFGenerator.generateReceipt(
      order,
      order.user,
      order.invoice
    );
    console.log(`✓ Receipt generated: ${receipt.relativePath}`);
    console.log("");

    // Step 5: Generate License Certificate PDF
    console.log("Step 5: Generating License Certificate PDF...");
    const allGtins = [
      ...order.assignedGtins.map((ag) => ag.gtin),
      ...unassignedGtins,
    ];

    const certificate = await PDFGenerator.generateLicenseCertificate({
      licensedTo: order.user.companyNameEn,
      licensee: "GST",
      gtins: unassignedGtins,
      issueDate: new Date().toLocaleDateString(),
      memberId: order.user.userId,
      email: order.user.email,
      phone: order.user.phone,
    });
    console.log(`✓ License Certificate generated: ${certificate.relativePath}`);
    console.log("");

    // Step 6: Update order with document paths
    console.log("Step 6: Updating order with document paths...");
    await prisma.order.update({
      where: { id: ORDER_ID },
      data: {
        receipt: addDomain(receipt.relativePath),
        licenseCertificate: addDomain(certificate.relativePath),
        status: "Activated",
      },
    });
    console.log("✓ Order updated with receipt and license certificate paths");
    console.log("");

    // Step 7: Generate Barcode Certificates for each assigned GTIN
    console.log("Step 7: Generating Barcode Certificates...");
    for (const assignment of gtinAssignments) {
      console.log(`  Generating certificate for GTIN: ${assignment.gtin.gtin}...`);

      const barcodeCert = await PDFGenerator.generateBarcodeCertificate({
        licensedTo: order.user.companyNameEn,
        gtin: assignment.gtin.gtin,
        issueDate: new Date(assignment.createdAt).toLocaleDateString(),
        memberId: order.user.userId,
        email: order.user.email,
        phone: order.user.phone,
      });

      // Update the AssignedGtin with the certificate path
      await prisma.assignedGtin.update({
        where: { id: assignment.id },
        data: {
          barcodeCertificate: addDomain(barcodeCert.relativePath),
        },
      });

      console.log(`    ✓ ${barcodeCert.relativePath}`);
    }
    console.log("");

    // Step 8: Summary
    console.log("=".repeat(60));
    console.log("SUMMARY");
    console.log("=".repeat(60));
    console.log(`Order: ${order.orderNumber}`);
    console.log(`GTINs Assigned: ${gtinAssignments.length}`);
    console.log(`Documents Generated:`);
    console.log(`  - Receipt: ${addDomain(receipt.relativePath)}`);
    console.log(`  - License Certificate: ${addDomain(certificate.relativePath)}`);
    console.log(`  - Barcode Certificates: ${gtinAssignments.length}`);
    console.log("");
    console.log("✅ Script completed successfully!");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();
