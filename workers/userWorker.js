import { Worker } from "bullmq";
import { connection } from "../config/queue.js";
import { deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";

const processUserDeletion = async (job) => {
  const { userId } = job.data;

  // Fetch user with all related data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      cart: {
        include: {
          items: {
            include: {
              addonItems: true,
            },
          },
        },
      },
      orders: {
        include: {
          invoice: true,
          orderItems: {
            include: {
              addonItems: true,
            },
          },
          assignedGtins: true,
        },
      },
      invoices: true,
      products: {
        include: {
          images: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Delete everything in a transaction
  await prisma.$transaction(async (prisma) => {
    // delete user product images
    if (user.products.length > 0) {
      for (const product of user.products) {
        for (const image of product.images) {
          await deleteFile(image.url);
        }
      }
    }

    // Cart deletion
    if (user.cart) {
      await prisma.cartItemAddon.deleteMany({
        where: {
          cartItemId: { in: user.cart.items.map((item) => item.id) },
        },
      });

      await prisma.cartItem.deleteMany({
        where: { cartId: user.cart.id },
      });
    }

    // Process orders
    for (const order of user.orders) {
      // Delete GTINs first
      await prisma.assignedGtin.deleteMany({
        where: { orderId: order.id },
      });

      // Delete order items and addons
      await prisma.orderItemAddon.deleteMany({
        where: {
          orderItemId: { in: order.orderItems.map((item) => item.id) },
        },
      });

      await prisma.orderItem.deleteMany({
        where: { orderId: order.id },
      });

      // Delete files and invoice
      if (order.invoice?.pdf) {
        await deleteFile(order.invoice.pdf);
        await prisma.invoice.delete({ where: { id: order.invoice.id } });
      }

      if (order.receipt) await deleteFile(order.receipt);
      if (order.licenseCertificate) await deleteFile(order.licenseCertificate);
      if (order.bankSlip) await deleteFile(order.bankSlip);

      await prisma.order.delete({ where: { id: order.id } });
    }

    // Process user products
    for (const product of user.userProducts) {
      // Delete product images from storage
      for (const image of product.images) {
        await deleteFile(image.url);
      }

      // Release GTIN if exists
      if (product.gtin) {
        await prisma.gtin.update({
          where: { gtin: product.gtin },
        });
      }
    }

    // Delete all product images
    await prisma.productImage.deleteMany({
      where: {
        product: {
          userId: userId,
        },
      },
    });

    // Delete all user products
    await prisma.userProduct.deleteMany({
      where: { userId },
    });

    // Delete cart
    if (user.cart) {
      await prisma.cart.delete({ where: { id: user.cart.id } });
    }

    // Finally delete user
    await prisma.user.delete({ where: { id: userId } });
  });

  return { success: true };
};

const worker = new Worker("user-deletion", processUserDeletion, { connection });

worker.on("completed", (job) => {
  console.log(`User deletion job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`User deletion job ${job.id} failed with error:`, err);
});

export default worker;
