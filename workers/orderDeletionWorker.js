import { Worker } from "bullmq";
import { connection } from "../config/queue.js";
import { deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";

/**
 * Process order deletion job
 * This worker handles all heavy lifting tasks for order deletion:
 * 1. Deletes all related files (invoices, receipts, certificates, bank slips)
 * 2. Releases assigned GTINs back to "Available" status
 * 3. Deletes all database records related to the order
 */
const processOrderDeletion = async (job) => {
  const { orderNumber } = job.data;

  console.log(`Starting deletion process for order: ${orderNumber}`);

  // Fetch order with all related data
  const order = await prisma.order.findFirst({
    where: { orderNumber },
    include: {
      assignedGtins: true,
      invoice: true,
      orderItems: {
        include: {
          addonItems: true,
        },
      },
      payment: true,
    },
  });

  if (!order) {
    throw new Error(`Order not found: ${orderNumber}`);
  }

  console.log(`Found order ${orderNumber} with ${order.assignedGtins.length} assigned GTINs`);

  // Collect all files to delete
  const filesToDelete = [];

  // Order-related files
  if (order.bankSlip) filesToDelete.push(order.bankSlip);
  if (order.licenseCertificate) filesToDelete.push(order.licenseCertificate);
  if (order.receipt) filesToDelete.push(order.receipt);

  // Invoice PDF
  if (order.invoice?.pdf) filesToDelete.push(order.invoice.pdf);

  // Barcode certificates for all assigned GTINs
  order.assignedGtins.forEach((assignedGtin) => {
    if (assignedGtin.barcodeCertificate) {
      filesToDelete.push(assignedGtin.barcodeCertificate);
    }
  });

  console.log(`Collected ${filesToDelete.length} files to delete`);

  // Delete all files (do this before database transaction to avoid orphaned files)
  const fileDeletePromises = filesToDelete.map((fileUrl) =>
    deleteFile(fileUrl).catch((err) => {
      console.error(`Failed to delete file ${fileUrl}:`, err);
      // Continue even if file deletion fails
    })
  );

  await Promise.all(fileDeletePromises);
  console.log(`Deleted ${filesToDelete.length} files`);

  // Get GTIN IDs to release
  const gtinIds = order.assignedGtins.map((ag) => ag.gtinId);

  // Perform all database operations in a transaction
  await prisma.$transaction(async (tx) => {
    // Release GTINs back to Available status
    if (gtinIds.length > 0) {
      await tx.gTIN.updateMany({
        where: { id: { in: gtinIds } },
        data: { status: "Available" },
      });
      console.log(`Released ${gtinIds.length} GTINs back to Available status`);
    }

    // Delete Invoice (explicitly, though it should cascade)
    if (order.invoice) {
      await tx.invoice.delete({
        where: { id: order.invoice.id },
      });
      console.log("Deleted invoice");
    }

    // Delete the order (this will cascade delete assignedGtins, orderItems, orderItemAddons, and payments)
    await tx.order.delete({
      where: { id: order.id },
    });
    console.log(`Deleted order ${orderNumber}`);
  });

  console.log(`Successfully completed deletion of order ${orderNumber}`);

  return {
    orderNumber,
    deletedFiles: filesToDelete.length,
    releasedGtins: gtinIds.length,
    status: "success",
  };
};

// Create worker
const worker = new Worker("order-deletion", processOrderDeletion, {
  connection,
});

worker.on("completed", (job) => {
  console.log(`Order deletion job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Order deletion job ${job.id} failed with error:`, err);
});

export default worker;
