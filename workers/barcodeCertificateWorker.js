import { Worker } from "bullmq";
import { connection } from "../config/queue.js";
import { addDomain } from "../utils/file.js";
import PDFGenerator from "../utils/pdfGenerator.js";
import prisma from "../utils/prismaClient.js";

const processBarcodeCertificate = async (job) => {
  const { id } = job.data;

  if (!id) {
    throw new Error("AssignedGtin ID is required");
  }

  try {
    // Get the assigned GTIN with its relationships
    const assignedGtin = await prisma.assignedGtin.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: true,
          },
        },
        GTIN: true,
      },
    });

    if (!assignedGtin) {
      throw new Error(`Assigned GTIN with ID ${id} not found`);
    }

    // Generate certificate
    const certificatePath = await PDFGenerator.generateBarcodeCertificate({
      gtin: assignedGtin.gtin,
      user: assignedGtin.order.user,
      date: assignedGtin.createdAt,
    });

    // Update the AssignedGtin with the certificate path
    await prisma.assignedGtin.update({
      where: { id },
      data: {
        barcodeCertificate: certificatePath,
      },
    });

    return addDomain(certificatePath);
  } catch (error) {
    console.error("Error processing barcode certificate:", error);
    throw error;
  }
};

const worker = new Worker("barcode-certificate", processBarcodeCertificate, {
  connection,
});

worker.on("completed", (job) => {
  console.log(`Barcode certificate job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Barcode certificate job ${job.id} failed:`, err);
});

export default worker;
