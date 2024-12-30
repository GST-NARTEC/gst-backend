import { Worker } from "bullmq";
import { connection } from "../config/queue.js";

import prisma from "../utils/prismaClient.js";

const processAggregation = async (job) => {
  const { gtin, batchNo, qty, calculateSerialNo, userId } = job.data;

  // create qty number of records
  for (let i = 0; i < qty; i++) {
    // create aggregation
    const aggregation = await prisma.aggregation.create({
      data: {
        gtin,
        batchNo,
        qty,
        userId,
      },
    });

    // update aggregation with serialNo
    const serialNo = await calculateSerialNo(gtin, batchNo, aggregation.id);

    console.log("serialNo", serialNo);

    await prisma.aggregation.update({
      where: { id: aggregation.id },
      data: { serialNo },
    });
  }
};

const worker = new Worker("aggregation", processAggregation, {
  connection,
});

worker.on("completed", (job) => {
  console.log(`Barcode certificate job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Barcode certificate job ${job.id} failed:`, err);
});

export default worker;
