import { Worker } from "bullmq";
import MyError from "../utils/error.js";
import { sendOrderConfirmation } from "../utils/mailer.js";
import PDFGenerator from "../utils/pdfGenerator.js";
import prisma from "../utils/prismaClient.js";

const processCheckoutNewUser = async (job) => {
  const { user, cart, paymentType, orderNumber } = job.data;

  try {
    const [activeVat, activeCurrency] = await Promise.all([
      prisma.vat.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.currency.findFirst({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (!activeVat) throw new MyError("No active VAT configuration found", 400);
    if (!activeCurrency)
      throw new MyError("No currency configuration found", 400);

    // Create order and process checkout
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: "Pending",
        paymentType,
        items: {
          create: cart.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            addons: {
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
        items: {
          include: {
            product: true,
            addons: {
              include: {
                addon: true,
              },
            },
          },
        },
        user: true,
      },
    });

    // Generate invoice
    const invoice = await prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber: `INV-${orderNumber}`,
        status: "Pending",
      },
    });

    // Generate PDF invoice
    const invoicePath = await PDFGenerator.generateDocument(
      order,
      user,
      invoice,
      "invoice"
    );

    // Send confirmation email
    await sendOrderConfirmation(user.email, {
      order,
      invoice,
      invoicePath,
    });

    return { order, invoice };
  } catch (error) {
    console.error("Checkout processing failed:", error);
    throw error;
  }
};

export const initCheckoutNewUserWorker = () => {
  const worker = new Worker("checkout-new-user", processCheckoutNewUser, {
    connection: redisConfig,
  });

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
  });

  return worker;
};
