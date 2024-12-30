import { Worker } from "bullmq";
import { connection } from "../config/queue.js";

import calculateSerialNo from "../utils/calculateSerial.js";
import prisma from "../utils/prismaClient.js";

const processAggregation = async (job) => {
  const { gtin, batchNo, qty, userId } = job.data;

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

    await prisma.aggregation.update({
      where: { id: aggregation.id },
      data: { serialNo },
    });
  }
};

const processUDI = async (job) => {
  const { gtin, batchNo, expiryDate, userId, qty } = job.data;

  // create qty number of records
  for (let i = 0; i < Number(qty); i++) {
    const udi = await prisma.uDI.create({
      data: {
        gtin,
        batchNo,
        expiryDate,
        userId,
      },
    });

    const serialNo = await calculateSerialNo(gtin, batchNo, udi.id);

    await prisma.uDI.update({
      where: { id: udi.id },
      data: { serialNo },
    });
  }
};

const worker = new Worker("aggregation", processAggregation, {
  connection,
});

const udiWorker = new Worker("udi", processUDI, {
  connection,
});

worker.on("completed", (job) => {
  console.log(`Barcode certificate job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Barcode certificate job ${job.id} failed:`, err);
});

udiWorker.on("completed", (job) => {
  console.log(`UDI job ${job.id} completed successfully`);
});

udiWorker.on("failed", (job, err) => {
  console.error(`UDI job ${job.id} failed:`, err);
});

export default { worker, udiWorker };
