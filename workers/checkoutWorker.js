import bcrypt from "bcrypt";
import { Worker } from "bullmq";

import { connection } from "../config/queue.js";
import EmailService from "../utils/email.js";
import { addDomain } from "../utils/file.js";
import { generatePassword } from "../utils/generatePassword.js";
import PDFGenerator from "../utils/pdfGenerator.js";
import prisma from "../utils/prismaClient.js";

const processCheckout = async (job) => {
  const { cart, user, paymentType, vat, activeVat, activeCurrency } = job.data;

  // Calculate totals
  const totalAmount = cart.items.reduce((sum, item) => {
    const productTotal = item.quantity * item.product.price;
    const addonsTotal = item.addonItems.reduce(
      (acc, addonItem) => acc + addonItem.addon.price * addonItem.quantity,
      0
    );
    return sum + productTotal + addonsTotal;
  }, 0);

  const vatAmount = vat;
  const overallAmount = totalAmount + vatAmount;

  console.log(vatAmount, totalAmount, overallAmount);

  // Generate password
  const password = generatePassword();
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create order and process everything in a transaction
  const result = await prisma.$transaction(async (prisma) => {
    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: job.data.orderNumber,
        userId: user.id,
        paymentType,
        totalAmount,
        vat: vatAmount,
        overallAmount,
        status: "Pending Payment",
        orderItems: {
          create: cart.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            addonItems: {
              create: item.addonItems.map((addonItem) => ({
                addonId: addonItem.addon.id,
                quantity: addonItem.quantity,
                price: addonItem.addon.price,
              })),
            },
          })),
        },
      },
      include: {
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

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isCreated: true,
      },
    });

    // Create invoice
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;
    const invoice = await prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber,
        userId: user.id,
        totalAmount,
        vat: vatAmount,
        overallAmount,
        paymentType,
        status: "completed",
      },
    });

    return { order, invoice, password };
  });

  // Generate PDF
  const pdfResult = await PDFGenerator.generateInvoice(
    result.order,
    user,
    result.invoice
  );

  // Update invoice with PDF
  await prisma.invoice.update({
    where: { id: result.invoice.id },
    data: {
      pdf: addDomain(pdfResult.relativePath),
    },
  });

  // Send email
  await EmailService.sendWelcomeEmail({
    email: user.email,
    order: result.order,
    password: result.password,
    user,
    currency: {
      symbol: activeCurrency.symbol,
      name: activeCurrency.name,
    },
    tax: {
      value: activeVat.value,
      type: activeVat.type,
    },
    attachments: [
      {
        filename: "invoice.pdf",
        path: pdfResult.absolutePath,
      },
    ],
  });

  return result;
};

// Create worker using shared connection
const worker = new Worker("checkout", processCheckout, { connection });

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

export default worker;
