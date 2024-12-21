import { Worker } from "bullmq";

import { connection } from "../config/queue.js";
import { addDomain } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";

export const userProductWorker = async (job) => {
  const { orders, productData } = job.data;
  let randomGtin,
    product,
    imagePaths = [];

  // now check each order one by one and check for available gtins in each order, if any order has available gtins, then pick one at random and create the product
  for (const order of orders) {
    console.log("order id", order.id);

    // find available gtin in the order
    const availableGtins = order.assignedGtins.filter(
      (gtin) => gtin.gtin?.status === "Sold"
    );

    if (availableGtins.length < 1) {
      console.log("No gtin is free in a specific order" + order.id);
      // change isSec to false in case if no gtin is free in a specific order
      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          isSec: false,
        },
      });
      continue;
    }

    if (availableGtins.length > 0) {
      console.log("Available gtin in a specific order" + order.id);
      // pick a random gtin from available gtins
      randomGtin =
        availableGtins[Math.floor(Math.random() * availableGtins.length)];

      // Handle image uploads
      const imageUrls = [];
      if (req.files?.images) {
        for (const file of req.files.images) {
          const imagePath = addDomain(file.path);
          imageUrls.push(imagePath);
          imagePaths.push(imagePath);
        }
      }

      // Create product
      product = await prisma.userProduct.create({
        data: {
          ...productData,
          gtin: randomGtin.gtin.gtin,
          userId: req.user.id,
          images: {
            create: imageUrls.map((url) => ({ url })),
          },
        },
        include: {
          images: true,
        },
      });

      console.log("Product created" + product.id);

      // check if it is last gtin of the order
      if (availableGtins.length === 1) {
        console.log("Last gtin of the order" + order.id);
        // update the isSec to false for this specific order
        await prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            isSec: false,
          },
        });
        continue;
      }

      // Update GTIN status to "Used"
      await prisma.gTIN.update({
        where: { gtin: randomGtin.gtin.gtin, status: "Sold" },
        data: {
          status: "Used",
        },
      });

      console.log("GTIN status updated to Used" + randomGtin.gtin.gtin);
      break;
    }
  }
};

// Create worker using shared connection
const worker = new Worker("user-product", userProductWorker, { connection });

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

export default worker;
