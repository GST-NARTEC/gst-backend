# PDF Generation Testing

This document explains how to test the PDF generation functionality for invoices.

## Overview

The `test-pdf-generation.js` script is a comprehensive testing tool that verifies if the PDF generation system is working correctly. It doesn't use Jest - it's a simple standalone Node.js script that you can run directly.

## Features

The test script performs the following checks:

1. ✅ **File Existence Check** - Verifies all required files are present:

   - Invoice EJS template
   - PDF Generator utility
   - ZATCA QR Generator
   - Price Calculator
   - Company logo

2. ✅ **Upload Directory Check** - Ensures the uploads directory exists and is writable

3. ✅ **Database Connection** - Tests database connectivity and checks for VAT/Currency configuration

4. ✅ **Template Structure** - Validates the invoice template has all necessary elements

5. ✅ **Mock PDF Generation** - Generates a test PDF using mock data to verify the generation process works

6. ✅ **Real Order PDF Generation** (Optional) - Tests PDF generation with actual order data from your database

## Usage

### Basic Test (Mock Data)

Run the test with mock data to verify the PDF generation system:

```bash
npm run test:pdf
```

or

```bash
node test-pdf-generation.js
```

This will:

- Check all required files
- Verify the upload directory
- Test database connection (if available)
- Generate a test PDF with mock data
- Display detailed results with color-coded output

### Test with Real Order

To test PDF generation with a real order from your database:

```bash
npm run test:pdf <order-id>
```

or

```bash
node test-pdf-generation.js <order-id>
```

Replace `<order-id>` with an actual order ID from your database.

**Example:**

```bash
npm run test:pdf abc123-def456-ghi789
```

## Output

The script provides detailed, color-coded output:

- 🟢 **Green** - Tests passed successfully
- 🔴 **Red** - Tests failed
- 🟡 **Yellow** - Warnings or optional tests skipped
- 🔵 **Cyan** - Information messages

### Sample Output

```
============================================================
PDF GENERATION TEST SUITE
============================================================

============================================================
TEST 1: Checking Required Files
============================================================

✓ Invoice template found: ./view/invoice.ejs
✓ PDF Generator utility found: ./utils/pdfGenerator.js
✓ ZATCA QR Generator found: ./utils/zatcaQrGenerator.js
✓ Price Calculator found: ./utils/priceCalculator.js
✓ Company logo found: ./assets/images/gst-logo.png

============================================================
TEST 2: Checking Upload Directory
============================================================

✓ Uploads directory created/verified: /path/to/uploads/pdfs
✓ Upload directory is writable

============================================================
TEST 3: Checking Database Connection
============================================================

✓ Active VAT found: 15% (percentage)
✓ Currency found: SAR (ر.س)

============================================================
TEST 4: Generating Test PDF with Mock Data
============================================================

ℹ Using mock data:
{...}

ℹ Generating PDF...
✓ PDF generated successfully!
ℹ Absolute path: /path/to/uploads/pdfs/invoice-INV-TEST-1234567890.pdf
ℹ Relative path: uploads/pdfs/invoice-INV-TEST-1234567890.pdf
✓ PDF file exists (45.32 KB)
✓ PDF file size looks good

============================================================
TEST SUMMARY
============================================================

✓ Required files exist: PASSED
✓ Upload directory writable: PASSED
✓ Database connection: PASSED (optional)
✓ Template structure valid: PASSED
✓ Mock PDF generation: PASSED

============================================================
Total Tests: 4
Passed: 4
Failed: 0

✓ All tests passed! PDF generation is working correctly.
============================================================
```

## Generated Test Files

When the test runs successfully, it creates:

- Test PDF file(s) in `uploads/pdfs/` directory
- Filename format: `invoice-INV-TEST-{timestamp}.pdf` for mock data
- The PDF will contain all invoice details including:
  - Company information
  - Order items and addons
  - Price calculations
  - VAT calculations
  - ZATCA-compliant QR code

## Troubleshooting

### Issue: "Required files not found"

**Solution:** Ensure you're running the script from the project root directory where all the required files are located.

### Issue: "Upload directory not writable"

**Solution:** Check folder permissions:

```bash
chmod -R 755 uploads
```

### Issue: "Database connection failed"

**Solution:**

- Check your `.env` file has correct database credentials
- Ensure the database is running
- Verify Prisma client is generated: `npx prisma generate`

### Issue: "PDF file size too small"

**Solution:** This might indicate a problem with:

- Puppeteer installation
- Missing Chrome/Chromium browser
- Template rendering issues

Try reinstalling Puppeteer:

```bash
npm install puppeteer --force
```

### Issue: "Logo not loading"

**Solution:** Ensure the logo file exists at:

```
assets/images/gst-logo.png
```

## Mock Data Structure

The test uses realistic mock data that includes:

- **User Information:**

  - Company name (English & Arabic)
  - Contact details
  - Address

- **Order Information:**

  - Multiple order items
  - Product details
  - Addon items
  - Quantity and pricing

- **Invoice Details:**
  - Invoice number
  - Timestamps
  - VAT calculations
  - Total amounts

## Exit Codes

- `0` - All tests passed
- `1` - One or more tests failed

This makes it easy to integrate into CI/CD pipelines if needed.

## Environment Requirements

- Node.js (ES Modules support)
- Puppeteer (for PDF generation)
- Database connection (optional for full testing)
- Write permissions on `uploads/` directory

## Related Files

- `utils/pdfGenerator.js` - Main PDF generation logic
- `view/invoice.ejs` - Invoice template
- `utils/zatcaQrGenerator.js` - QR code generation for ZATCA compliance
- `utils/priceCalculator.js` - Price calculation utilities

## Notes

- The test script is completely independent of Jest
- It can be run anytime to verify PDF generation is working
- Safe to run in production - uses mock data by default
- Real order testing is optional and only runs when order ID is provided
- Database connection is optional - test will continue even if database is unavailable
