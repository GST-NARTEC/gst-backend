import { Worker } from "bullmq";
import { redisConfig } from "../config/redis.js";
import EmailService from "../utils/email.js";
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
          create: user.cart.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            addons: {
              create: (item.addonItems || []).map((addonItem) => ({
                addonId: addonItem.addon.id,
                quantity: addonItem.quantity,
                price: addonItem.addon.price,
              })),
            },
          })),
        },
        vat: vat || activeVat.percentage,
        currency: activeCurrency.symbol,
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
      },
    });

    // Send order confirmation email
    await EmailService.sendOrderConfirmation({
      to: user.email,
      orderNumber: order.orderNumber,
      items: order.items,
      total: order.total,
      vat: order.vat,
      currency: order.currency,
    });

    return { order };
  } catch (error) {
    console.error("Checkout processing failed:", error);
    throw error;
  }
};

export const initCreateWithCartAndCheckoutWorker = () => {
  const worker = new Worker(
    "create-with-cart-and-checkout",
    processCreateWithCartAndCheckout,
    {
      connection: redisConfig,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
  });

  return worker;
};
