import { Worker } from "bullmq";
import { connection } from "../config/queue.js";
import { addDomain } from "../utils/file.js";
import PDFGenerator from "../utils/pdfGenerator.js";
import prisma from "../utils/prismaClient.js";

const generateBarcodeCertificate = async (job) => {
  const { gtinId, orderId } = job.data;

  // Fetch GTIN with related data
  const gtin = await prisma.gTIN.findUnique({
    where: { id: gtinId },
    include: {
      assignedGtins: {
        include: {
          order: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!gtin || !gtin.assignedGtins[0]) {
    throw new Error("GTIN or assignment not found");
  }

  const {
    order,
    order: { user },
  } = gtin.assignedGtins[0];

  // Generate certificate
  const certificate = await PDFGenerator.generatePDF("barcodeCertificate", {
    licensedTo: user.companyNameEn,
    barcodeId: gtin.gtin,
    issueDate: new Date().toLocaleDateString(),
    memberId: user.userId,
    email: user.email,
    phone: user.phone,
    logo: process.env.LOGO_URL,
  });

  // Update GTIN with certificate path
  await prisma.gTIN.update({
    where: { id: gtinId },
    data: {
      barcodeCertificate: addDomain(certificate.relativePath),
    },
  });

  return certificate.relativePath;
};

// Create worker
const worker = new Worker("barcode-certificate", generateBarcodeCertificate, {
  connection,
});

worker.on("completed", (job) => {
  console.log(`Barcode certificate job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Barcode certificate job ${job.id} failed:`, err);
});

export default worker;
