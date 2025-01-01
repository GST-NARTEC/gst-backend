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
          assignedGtins: {
            include: {
              gtin: true,
            },
          },
        },
      },
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
      // Release GTINs
      if (order.assignedGtins?.length > 0) {
        for (const assignedGtin of order.assignedGtins) {
          if (assignedGtin.gtin) {
            await prisma.gTIN.update({
              where: {
                id: assignedGtin.gtin.id,
                gtin: assignedGtin.gtin.gtin,
              },
              data: {
                status: "Available",
              },
            });
          }
        }
      }

      // Delete GTINs assignments
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
        await prisma.invoice.delete({
          where: { id: order.invoice.id },
        });
      }

      if (order.receipt) await deleteFile(order.receipt);
      if (order.licenseCertificate) await deleteFile(order.licenseCertificate);
      if (order.bankSlip) await deleteFile(order.bankSlip);

      await prisma.order.delete({ where: { id: order.id } });
    }

    // Process user products
    if (user.products?.length > 0) {
      for (const product of user.products) {
        // Delete product images from storage
        for (const image of product.images) {
          await deleteFile(image.url);
        }

        // Release GTIN if exists
        if (product.gtin) {
          const existingGtin = await prisma.gTIN.findUnique({
            where: { gtin: product.gtin },
          });

          if (existingGtin) {
            await prisma.gTIN.update({
              where: {
                id: existingGtin.id,
                gtin: existingGtin.gtin,
              },
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

    // Delete user docs
    if (user.docs?.length > 0) {
      for (const doc of user.docs) {
        await deleteFile(doc.doc);
        await prisma.userDoc.delete({ where: { id: doc.id } });
      }
    }

    // Delete user brands
    if (user.brands?.length > 0) {
      for (const brand of user.brands) {
        await deleteFile(brand.document);
        await prisma.brand.delete({ where: { id: brand.id } });
      }
    }

    // Delete user help tickets
    if (user.helpTickets?.length > 0) {
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
