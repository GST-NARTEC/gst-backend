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
      docs: true,
      brands: true,
      helpTickets: true,
    },
  });

  console.log(user);

  if (!user) {
    throw new Error("User not found");
  }

  // Delete everything in a transaction
  await prisma.$transaction(async (prisma) => {
    // Get all order IDs for this user
    const orders = await prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        invoice: {
          select: { id: true },
        },
        orderItems: {
          select: { id: true },
        },
      },
    });

    const orderIds = orders.map((order) => order.id);

    if (orderIds.length > 0) {
      // 1. First delete all invoices
      await prisma.invoice.deleteMany({
        where: {
          orderId: { in: orderIds },
        },
      });

      // 2. Delete all order item addons
      await prisma.orderItemAddon.deleteMany({
        where: {
          orderItem: {
            orderId: { in: orderIds },
          },
        },
      });

      // 3. Delete all order items
      await prisma.orderItem.deleteMany({
        where: {
          orderId: { in: orderIds },
        },
      });

      // 4. Delete assigned GTINs
      await prisma.assignedGtin.deleteMany({
        where: {
          orderId: { in: orderIds },
        },
      });

      // 5. Finally delete orders
      await prisma.order.deleteMany({
        where: {
          id: { in: orderIds },
        },
      });
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
      // release GTINs
      if (order.assignedGtins && order.assignedGtins?.length > 0) {
        for (const gtin of order.assignedGtins) {
          await prisma.gTIN?.update({
            where: { gtin: gtin.gtin },
            data: { status: "Available" },
          });
        }
      }

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
    if (user.products && user.products?.length > 0) {
      for (const product of user.products) {
        // Delete product images from storage
        for (const image of product.images) {
          await deleteFile(image.url);
        }

        // Release GTIN if exists
        if (product?.gtin) {
          // Add a check if GTIN exists in the database
          const existingGtin = await prisma.gTIN?.findUnique({
            where: { gtin: product.gtin },
          });

          if (existingGtin) {
            await prisma.gTIN?.update({
              where: { gtin: product.gtin },
              data: {
                status: "Available",
              },
            });
          }
        }
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

    // delete user docs
    if (user.docs && user.docs?.length > 0) {
      for (const doc of user.docs) {
        await deleteFile(doc.doc);
        await prisma.userDoc.delete({ where: { id: doc.id } });
      }
    }

    // delete user brands
    if (user.brands && user.brands?.length > 0) {
      for (const brand of user.brands) {
        await deleteFile(brand.document);
        await prisma.brand.delete({ where: { id: brand.id } });
      }
    }

    // delete user help tickets
    if (user.helpTickets && user.helpTickets?.length > 0) {
      for (const ticket of user.helpTickets) {
        if (ticket.doc) await deleteFile(ticket.doc);
        await prisma.helpTicket.delete({ where: { id: ticket.id } });
      }
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
