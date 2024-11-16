import fs from "fs-extra";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PDFGenerator {
  static async generateInvoice(order, user, invoice) {
    // Define fonts with correct path (just one level up)
    const FONTS = {
      arabic: path.join(__dirname, "../assets/fonts/DubaiRegular.ttf"),
      // or for Amiri:
      // arabic: path.join(__dirname, '../assets/fonts/Amiri-Regular.ttf'),
    };

    // Verify font exists
    if (!fs.existsSync(FONTS.arabic)) {
      console.error("Arabic font not found:", FONTS.arabic);
      throw new Error("Arabic font file not found");
    }

    const colors = {
      primary: "#1F3A8A",
      secondary: "#6B7280",
      accent: "#2563EB",
      success: "#059669",
      background: "#F8FAFC",
      text: "#1F2937",
    };

    // Create PDF with custom font
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      features: {
        direction: "rtl",
      },
    });

    // Register Arabic font
    doc.registerFont("Arabic", FONTS.arabic);
    doc.font("Arabic"); // Set as default font

    const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
    const filePath = path.join("uploads", "pdfs", fileName);
    await fs.ensureDir(path.join("uploads", "pdfs"));
    doc.pipe(fs.createWriteStream(filePath));

    // Add background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.background);

    // Header section
    doc
      .rect(50, 50, doc.page.width - 100, 120)
      .fillAndStroke("#FFFFFF", colors.primary);

    // Company header
    doc
      .fillColor(colors.primary)
      .fontSize(24)
      .text("GST Saudi Arabia / جي إس تي السعودية", 50, 70, {
        align: "center",
      });

    // Contact info
    doc
      .fontSize(10)
      .fillColor(colors.secondary)
      .text(`📞 ${user.mobile} / هاتف`, { align: "center" })
      .text(`📍 ${user.streetAddress}`, { align: "center" });

    // Invoice details box
    doc
      .rect(50, 190, doc.page.width - 100, 120)
      .fill("#FFFFFF")
      .strokeColor(colors.accent)
      .stroke();

    // Invoice details
    const invoiceDetails = [
      {
        label: "INVOICE DATE / تاريخ الفاتورة",
        value: new Date(invoice.createdAt).toLocaleDateString("ar-SA"),
      },
      {
        label: "INVOICE ID / رقم الفاتورة",
        value: `#${invoice.invoiceNumber}`,
      },
      { label: "PAYMENT TYPE / طريقة الدفع", value: order.paymentType },
      {
        label: "CUSTOMER / العميل",
        value: `${user.companyNameEn} / ${user.companyNameAr}`,
      },
    ];

    let yPos = 210;
    invoiceDetails.forEach((detail) => {
      doc
        .fontSize(10)
        .fillColor(colors.secondary)
        .text(detail.label, 70, yPos)
        .fillColor(colors.text)
        .text(detail.value, 300, yPos);
      yPos += 25;
    });

    // Items table
    const tableTop = 340;
    doc.rect(50, tableTop - 10, doc.page.width - 100, 30).fill("#F1F5F9");

    // Table headers
    doc
      .fillColor(colors.primary)
      .fontSize(10)
      .text("Description / الوصف", 70, tableTop)
      .text("Qty / الكمية", 350, tableTop)
      .text("Amount / المبلغ", 450, tableTop);

    // Table items
    let y = tableTop + 30;
    order.orderItems.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.rect(50, y - 5, doc.page.width - 100, 25).fill("#F8FAFC");
      }

      doc
        .fillColor(colors.text)
        .text(item.product.title, 70, y)
        .text(item.quantity.toString(), 350, y)
        .text(`SAR ${item.price.toFixed(2)}`, 450, y);
      y += 25;
    });

    // Totals section with wider box
    const totalsY = y + 20;
    doc
      .rect(250, totalsY, doc.page.width - 300, 130)
      .fill("#FFFFFF")
      .strokeColor(colors.accent)
      .stroke();

    const totals = [
      {
        label: "Subtotal / المجموع الفرعي",
        value: `SAR ${order.totalAmount.toFixed(2)}`,
        style: "normal",
      },
      {
        label: "VAT (0%) / ضريبة القيمة المضافة",
        value: `SAR ${order.vat.toFixed(2)}`,
        style: "normal",
      },
      {
        label: "Grand Total / المجموع الكلي",
        value: `SAR ${order.overallAmount.toFixed(2)}`,
        style: "grand",
      },
    ];

    let totalYPos = totalsY + 20;
    totals.forEach((total, index) => {
      const isGrand = total.style === "grand";

      // Label (left side, English and Arabic together)
      doc
        .fontSize(isGrand ? 12 : 10)
        .fillColor(isGrand ? colors.success : colors.text)
        .text(total.label, 270, totalYPos, {
          width: 190,
          align: "left",
        });

      // Amount (right side with more spacing)
      doc.text(total.value, 520, totalYPos, {
        width: 80,
        align: "right",
      });

      // Add separator before grand total
      if (index === 1) {
        doc
          .strokeColor(colors.accent)
          .moveTo(270, totalYPos + 25)
          .lineTo(520, totalYPos + 25)
          .stroke();
        totalYPos += 15;
      }

      totalYPos += 35;
    });

    // Footer - moved up
    const footerY = doc.page.height - 200;
    doc
      .rect(50, footerY, doc.page.width - 100, 100)
      .fill("#FFFFFF")
      .strokeColor(colors.primary)
      .stroke();

    // QR code and signature side by side
    const qrCodeData = await QRCode.toDataURL(invoice.invoiceNumber);
    doc.image(qrCodeData, 70, footerY + 10, {
      fit: [80, 80],
    });

    // Verification text moved to the left side
    doc
      .fontSize(10)
      .fillColor(colors.secondary)
      .text("Scan to verify / امسح للتحقق", 70, footerY + 85)
      .text(invoice.invoiceNumber, 70, footerY + 95);

    // Signature
    doc
      .fontSize(10)
      .text("Authorized Signature / التوقيع المعتمد", 350, footerY + 40)
      .lineWidth(0.5)
      .moveTo(350, footerY + 70)
      .lineTo(500, footerY + 70)
      .stroke();

    doc.end();
    return filePath;
  }
}

export default PDFGenerator;
