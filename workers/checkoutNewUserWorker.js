import { Worker } from "bullmq";
import { connection } from "../config/queue.js";
import EmailService from "../utils/email.js";
import { addDomain } from "../utils/file.js";
import PDFGenerator from "../utils/pdfGenerator.js";
import prisma from "../utils/prismaClient.js";

const processCreateWithCartAndCheckout = async (job) => {
  const { user, paymentType, vat, orderNumber } = job.data;

  try {
    // Get active VAT and currency
    const [activeVat, activeCurrency] = await Promise.all([
      prisma.vat.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.currency.findFirst({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (!activeVat) throw new Error("No active VAT configuration found");
    if (!activeCurrency) throw new Error("No currency configuration found");

    // Calculate totals
    const totalAmount = user.cart.items.reduce((sum, item) => {
      const productTotal = item.quantity * item.product.price;
      const addonsTotal = item.addonItems.reduce(
        (acc, addonItem) => acc + addonItem.addon.price * addonItem.quantity,
        0
      );
      return sum + productTotal + addonsTotal;
    }, 0);

    const vatAmount = vat || activeVat.percentage;
    const overallAmount = totalAmount + vatAmount;

    // Create order and process everything in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: user.id,
          status: "Pending Payment",
          paymentType,
          totalAmount,
          vat: vatAmount,
          overallAmount,
          currency: activeCurrency.symbol,
          orderItems: {
            create: user.cart.items.map((item) => ({
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

      // Clear cart after successful order creation
      await prisma.cartItemAddon.deleteMany({
        where: {
          cartItemId: { in: user.cart.items.map((item) => item.id) },
        },
      });

      await prisma.cartItem.deleteMany({
        where: { cartId: user.cart.id },
      });

      await prisma.cart.delete({
        where: { id: user.cart.id },
      });

      return { order, invoice };
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
    await EmailService.sendOrderConfirmation({
      to: user.email,
      orderNumber: result.order.orderNumber,
      items: result.order.orderItems,
      total: result.order.totalAmount,
      vat: result.order.vat,
      currency: activeCurrency.symbol,
      attachments: [
        {
          filename: "invoice.pdf",
          path: pdfResult.absolutePath,
        },
      ],
    });

    return result;
  } catch (error) {
    console.error("Checkout processing failed:", error);
    throw error;
  }
};

const worker = new Worker(
  "create-with-cart-and-checkout",
  processCreateWithCartAndCheckout,
  {
    connection,
    concurrency: 5,
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000, // Keep last 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

export default worker;
