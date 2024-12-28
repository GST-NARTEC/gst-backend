import { Worker } from "bullmq";
import { connection } from "../config/queue.js";

import prisma from "../utils/prismaClient.js";

const calculateSerialNo = async (gtin, batch, id) => {
  // last 10 digits of gtin
  const gtinLast10 = gtin.slice(-10);

  // concate gtinLast10 with batch and id along with dashes
  const serialNo = `${gtinLast10}-${batch}-${id}`;

  return serialNo;
};

const processAggregation = async (job) => {
  const { gtin, batchNo, qty } = job.data;

  // create qty number of records
  for (let i = 0; i < qty; i++) {
    // create aggregation
    const aggregation = await prisma.aggregation.create({
      data: {
        gtin,
        batchNo,
        qty,
      },
    });

    // update aggregation with serialNo
    const serialNo = await calculateSerialNo(gtin, batchNo, aggregation.id);

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
