import bwipjs from "bwip-js";
import crypto from "crypto";
import fs from "fs";
import moment from "moment";
import path from "path";

// Helper for TLV encoding
function toTLV(tag, value) {
  const tagHex = Buffer.from([tag]);
  const valueBuffer = Buffer.from(value, "utf-8");
  const lengthHex = Buffer.from([valueBuffer.length]);
  return Buffer.concat([tagHex, lengthHex, valueBuffer]);
}

/**
 * Generates ZATCA-compliant QR code data in TLV format (Phase 2)
 * @param {Object} invoice - The invoice object
 * @param {Object} user - The user/company object
 * @returns {Promise<string>} - Base64 data URL of the QR code
 */
export async function generateZatcaQrCodeForInvoice(invoice, user, data) {
  try {
    // 1. Extract relevant data from invoice and user objects
    // const sellerName = user.companyNameEn;
    const sellerName = "ALMYAR ALALMI FOR TECHNOLOGIES COMPANY";
    const vatNumber = "312408381800003";
    const invoiceTimestamp = moment(invoice.createdAt).format(
      "yyyy-MM-DDTHH:mm:ssZ"
    );
    const invoiceTotal = data?.totals?.grandTotal
      ? data?.totals?.grandTotal.toString()
      : "0.00";
    const vatAmount = data?.totals?.vat
      ? data?.totals?.vat?.toString()
      : "0.00";
    const invoiceNumber = invoice.invoiceNumber ?? data?.invoice?.number;

    // Generate a UUID if not available in the invoice
    const uuid =
      invoice.uuid || crypto.randomUUID().replace(/-/g, "").substring(0, 20);
    const isSimplified = true; // Set to true for simplified invoice format

    // 1. Basic invoice data (Phase 1 fields)
    const phase1Data = Buffer.concat([
      toTLV(1, sellerName),
      toTLV(2, vatNumber),
      toTLV(3, invoiceTimestamp),
      toTLV(4, invoiceTotal),
      toTLV(5, vatAmount),
    ]);

    // 2. Phase 2 additional required fields
    const phase2Data = Buffer.concat([
      phase1Data,
      toTLV(6, uuid), // Invoice UUID
      toTLV(7, isSimplified ? "1" : "0"), // Is simplified invoice
      toTLV(8, invoiceNumber), // Invoice number
    ]);

    try {
      // 3. Read private key and certificate
      const certDir = path.join(process.cwd(), "zatca_certs");
      const privateKey = fs.readFileSync(
        path.join(certDir, "private_key.pem"),
        "utf8"
      );
      const certificate = fs.readFileSync(
        path.join(certDir, "certificate.pem"),
        "utf8"
      );

      // 4. Sign the data
      const sign = crypto.createSign("RSA-SHA256");
      sign.update(phase2Data);
      const signature = sign.sign(privateKey, "base64");

      // 5. Create final TLV with signature and certificate (using simplified version for testing)
      const finalTlv = Buffer.concat([
        phase2Data,
        toTLV(10, signature.substring(0, 100)), // Truncated signature for testing
        toTLV(11, certificate.substring(0, 20)), // Truncated certificate for testing
      ]);

      // 6. Base64 encode the final TLV
      const base64Data = finalTlv.toString("base64");

      // 7. Generate QR code image
      const png = await bwipjs.toBuffer({
        bcid: "qrcode", // QR code type
        text: base64Data, // Data to encode
        scale: 4, // Scaling factor
        height: 40, // Height in mm
        width: 40, // Width in mm
        includetext: false, // Don't show human-readable text
        padding: 0, // No padding
        backgroundcolor: "FFFFFF", // White background
        borderwidth: 0, // No additional border
      });

      return `data:image/png;base64,${png.toString("base64")}`;
    } catch (certError) {
      console.warn(
        "Certificate files not found, falling back to Phase 1:",
        certError.message
      );

      // Fallback to Phase 1 if certificates aren't available
      const tlvs = Buffer.concat([
        toTLV(1, sellerName),
        toTLV(2, vatNumber),
        toTLV(3, invoiceTimestamp),
        toTLV(4, invoiceTotal),
        toTLV(5, vatAmount),
      ]);

      const base64Data = tlvs.toString("base64");

      const png = await bwipjs.toBuffer({
        bcid: "qrcode",
        text: base64Data,
        scale: 3,
        height: 30,
        width: 30,
        includetext: false,
        padding: 0,
        backgroundcolor: "FFFFFF",
        borderwidth: 0,
      });

      return `data:image/png;base64,${png.toString("base64")}`;
    }
  } catch (error) {
    console.error("Error generating ZATCA QR code:", error);
    throw error;
  }
}

export default generateZatcaQrCodeForInvoice;
