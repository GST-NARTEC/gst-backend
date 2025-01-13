import { Worker } from "bullmq";
import path from "path";
import { fileURLToPath } from "url";

import { barcodeCertificateQueue, connection } from "../config/queue.js";
import EmailService from "../utils/email.js";
import { addDomain } from "../utils/file.js";
import PDFGenerator from "../utils/pdfGenerator.js";
import prisma from "../utils/prismaClient.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const processOrderActivation = async (job) => {
  const { orderNumber, onlinePayment } = job.data;
  let order;

  // First fetch with all necessary includes
  order = await prisma.order.findFirst({
    where: { orderNumber },
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
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status === "Activated") {
    throw new Error("Account is already activated");
  }

  if (order.status !== "Pending Account Activation" && !onlinePayment) {
    throw new Error("Order is not in pending activation status");
  }

  if (onlinePayment) {
    // update payment order number
    await prisma.payment.update({
      where: { merchantReference: orderNumber },
      data: { orderId: order.id },
    });
  }

  // Calculate total quantity needed
  const totalQuantity = order.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Get available GTINs
  const availableGtins = await prisma.gTIN.findMany({
    where: { status: "Available" },
    take: totalQuantity,
  });

  if (availableGtins.length < totalQuantity) {
    throw new Error("Not enough GTINs available");
  }

  // First, log the entire order items array
  console.log("All order items:", order.orderItems);

  // Track the current GTIN index
  let currentGtinIndex = 0;
  const availableGtinsWithProduct = [];

  for (const orderItem of order.orderItems) {
    console.log(`Processing order item:`, orderItem);
    const quantity = orderItem.quantity;
    const barcodeType = orderItem.product?.barcodeTypeId;

    console.log(`Barcode type:`, barcodeType);

    // Assign unique GTINs for each quantity of this order item
    for (let i = 0; i < quantity; i++) {
      console.log(
        `Assigning GTIN at index ${currentGtinIndex}:`,
        availableGtins[currentGtinIndex]
      );
      availableGtinsWithProduct.push({
        ...availableGtins[currentGtinIndex],
        barcodeTypeId: barcodeType,
      });
      currentGtinIndex++;
    }
  }

  // Log the final result
  console.log("Final GTINs with products:", availableGtinsWithProduct);

  // Process everything in a transaction
  const result = await prisma.$transaction(async (prisma) => {
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: "Activated" },
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
              include: { addon: true },
            },
          },
        },
      },
    });

    // Update GTINs status and create assignments
    const gtinAssignments = await Promise.all(
      availableGtinsWithProduct.map((gtin) =>
        prisma.assignedGtin.create({
          data: {
            orderId: order.id,
            gtinId: gtin.id,
            barcodeTypeId: gtin.barcodeTypeId || null,
          },
        })
      )
    );

    // Update GTIN status
    await prisma.gTIN.updateMany({
      where: { id: { in: availableGtins.map((g) => g.id) } },
      data: { status: "Sold" },
    });

    // Add barcode certificate generation jobs
    await Promise.all(
      gtinAssignments.map((assignment) =>
        barcodeCertificateQueue.add(
          "barcode-certificate",
          {
            assignedGtinId: assignment.id,
          },
          {
            jobId: `barcode-cert-${assignment.id}`,
          }
        )
      )
    );

    return { updatedOrder, gtinAssignments, gtins: availableGtins };
  });

  // Generate documents
  const receipt = await PDFGenerator.generateReceipt(
    result.updatedOrder,
    result.updatedOrder.user,
    result.updatedOrder.invoice
  );

  const certificate = await PDFGenerator.generateLicenseCertificate({
    licensedTo: result.updatedOrder.user.companyNameEn,
    licensee: "GST",
    gtins: result.gtins,
    issueDate: new Date().toLocaleDateString(),
    memberId: result.updatedOrder.user.userId,
    email: result.updatedOrder.user.email,
    phone: result.updatedOrder.user.phone,
  });

  const termsPath = path.join(
    __dirname,
    "..",
    "assets",
    "docs",
    "terms-and-conditions.pdf"
  );

  // Update order with document paths (with domain)
  await prisma.order.update({
    where: { id: order.id },
    data: {
      receipt: addDomain(receipt.relativePath),
      licenseCertificate: addDomain(certificate.relativePath),
    },
  });

  // Get currency data
  const currency = await prisma.currency.findFirst({
    orderBy: { createdAt: "desc" },
  });

  // Send activation email with documents
  await EmailService.sendOrderActivationEmail({
    email: result.updatedOrder.user.email,
    order: result.updatedOrder,
    user: result.updatedOrder.user,
    currency,
    attachments: [
      {
        filename: `receipt-${result.updatedOrder.invoice.invoiceNumber}.pdf`,
        path: receipt.absolutePath,
      },
      {
        filename: `license-certificate-${result.updatedOrder.orderNumber}.pdf`,
        path: certificate.absolutePath,
      },
      {
        filename: "terms-and-conditions.pdf",
        path: termsPath,
      },
    ],
  });

  return {
    status: result.updatedOrder.status,
    assignedGtins: result.gtins.map((g) => g.gtin),
  };
};

// Create worker
const worker = new Worker("order-activation", processOrderActivation, {
  connection,
});

worker.on("completed", (job) => {
  console.log(`Order activation job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Order activation job ${job.id} failed with error:`, err);
});

export default worker;
