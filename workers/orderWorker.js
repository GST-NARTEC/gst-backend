import { Worker } from "bullmq";
import { connection } from "../config/queue.js";
import EmailService from "../utils/email.js";
import PDFGenerator from "../utils/pdfGenerator.js";
import prisma from "../utils/prismaClient.js";

const processOrderActivation = async (job) => {
  const { orderNumber } = job.data;
  let order;

  // First fetch with all necessary includes
  order = await prisma.order.findFirst({
    where: { orderNumber },
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
    throw new Error("Order not found");
  }

  if (order.status === "Activated") {
    throw new Error("Account is already activated");
  }

  if (order.status !== "Pending Account Activation") {
    throw new Error("Order is not in pending activation status");
  }

  // Update order with includes to get fresh data
  order = await prisma.order.update({
    where: { id: order.id },
    data: { status: "Activated" },
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

  // Generate receipt
  const receipt = await PDFGenerator.generateReceipt(
    order,
    order.user,
    order.invoice
  );

  // Send activation email with receipt
  await EmailService.sendOrderActivationEmail({
    email: order.user.email,
    order: order,
    user: order.user,
    attachments: [
      {
        filename: `receipt-${order.invoice.invoiceNumber}.pdf`,
        path: receipt.absolutePath,
      },
    ],
  });

  return { status: order.status };
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
