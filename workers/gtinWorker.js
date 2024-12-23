import { Worker } from "bullmq";
import { connection } from "../config/queue.js";
import prisma from "../utils/prismaClient.js";

const processGTINs = async (gtins) => {
  const results = {
    inserted: 0,
    skipped: 0,
  };

  for (const gtin of gtins) {
    try {
      await prisma.gTIN.create({
        data: {
          gtin,
          status: "Available",
        },
      });
      results.inserted++;
    } catch (error) {
      if (error.code === "P2002") {
        // Unique constraint violation
        results.skipped++;
      } else {
        throw error;
      }
    }
  }

  return results;
};

const worker = new Worker(
  "gtin-processing",
  async (job) => {
    const { gtins } = job.data;
    return await processGTINs(gtins);
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

export default worker;
