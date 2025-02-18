import { Worker } from "bullmq";

import { connection } from "../config/queue.js";
import { addDomain } from "../utils/file.js";
import PDFGenerator from "../utils/pdfGenerator.js";
import prisma from "../utils/prismaClient.js";

const processBarcodeCertificate = async (job) => {
  console.log("Received job data:", job.data);

  const { assignedGtinId } = job.data;

  if (!assignedGtinId) {
    console.error("Missing job data:", job.data);
    throw new Error("AssignedGtin ID is required");
  }

  try {
    // Get the assigned GTIN with its relationships
    const assignedGtin = await prisma.assignedGtin.findUnique({
      where: { id: assignedGtinId },
      include: {
        order: {
          include: {
            user: true,
          },
        },
        gtin: true,
      },
    });

    if (!assignedGtin) {
      throw new Error(`Assigned GTIN with ID ${assignedGtinId} not found`);
    }

    // Generate certificate
    const certificatePath = await PDFGenerator.generateBarcodeCertificate({
      licensedTo: assignedGtin.order.user.companyNameEn,
      gtin: assignedGtin.gtin.gtin,
      issueDate: new Date(assignedGtin.createdAt).toLocaleDateString(),
      memberId: assignedGtin.order.user.userId,
      email: assignedGtin.order.user.email,
      phone: assignedGtin.order.user.phone,
    });

    // Update the AssignedGtin with the certificate path (using relativePath)
    await prisma.assignedGtin.update({
      where: { id: assignedGtinId },
      data: {
        barcodeCertificate: addDomain(certificatePath.relativePath),
      },
    });

    return addDomain(certificatePath.relativePath);
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
