import fs from "fs-extra";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

class PDFGenerator {
  static async generateInvoice(order, user, invoice) {
    // Create a new PDF document with RTL support
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      features: {
        direction: "rtl",
      },
    });

    const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
    const filePath = path.join("uploads", "pdfs", fileName);

    // Ensure directory exists
    await fs.ensureDir(path.join("uploads", "pdfs"));

    // Pipe PDF to file
    doc.pipe(fs.createWriteStream(filePath));

    // Add company header without logo
    doc.fontSize(20).text("GS1 Saudi Arabia", { align: "center" });

    // Add contact info
    doc
      .fontSize(12)
      .text(`Phone / هاتف: ${user.mobile}`, { align: "center" })
      .text(`${user.streetAddress}`, { align: "center" });

    // Add invoice details (bilingual)
    doc
      .moveDown()
      .fontSize(10)
      .text(
        `INVOICE DATE / تاريخ الفاتورة: ${new Date(
          invoice.createdAt
        ).toLocaleDateString()}`
      )
      .text(`INVOICE ID / رقم الفاتورة: #${invoice.invoiceNumber}`)
      .text(`TYPE / النوع: ${order.paymentType}`)
      .text(`CUSTOMER / العميل: ${user.companyNameEn} / ${user.companyNameAr}`);

    // Add table headers
    let y = 300;
    doc
      .text("Description / الوصف", 50, y)
      .text("Qty / الكمية", 300, y)
      .text("Amount / المبلغ", 400, y);

    // Add items
    y += 20;
    order.orderItems.forEach((item) => {
      doc
        .text(item.product.title, 50, y)
        .text(item.quantity.toString(), 300, y)
        .text(`AED ${item.price.toFixed(2)}`, 400, y);
      y += 15;
    });

    // Add totals
    y += 20;
    doc
      .text(
        `Subtotal / المجموع الفرعي: AED ${order.totalAmount.toFixed(2)}`,
        300,
        y
      )
      .text(
        `VAT / ضريبة القيمة المضافة (0%): AED ${order.vat.toFixed(2)}`,
        300,
        y + 20
      )
      .text(
        `Grand Total / المجموع الكلي: AED ${order.overallAmount.toFixed(2)}`,
        300,
        y + 40
      );

    // Add Terms and Signature
    doc
      .moveDown(4)
      .text("Terms and Conditions / الشروط والأحكام", { align: "center" })
      .moveDown()
      .text("Signature / التوقيع: _________________", { align: "center" });

    // Generate and add QR code
    const qrCodeData = await QRCode.toDataURL(invoice.invoiceNumber);
    doc.image(qrCodeData, {
      fit: [100, 100],
      align: "center",
    });

    // Add verification text
    doc
      .moveDown()
      .fontSize(10)
      .text("Scan to verify / امسح للتحقق", { align: "center" })
      .text(invoice.invoiceNumber, { align: "center" });

    doc.end();
    return filePath;
  }
}

export default PDFGenerator;
