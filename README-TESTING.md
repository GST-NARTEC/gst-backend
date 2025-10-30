# PDF Generation Testing Guide

## Overview

I've created **two test scripts** for testing your PDF generation functionality without using Jest. Both are simple Node.js scripts that you can run directly.

## Test Scripts

### 1. Quick Test (`quick-pdf-test.js`) ⚡

**Recommended for quick verification**

A minimal, fast test that generates a single test PDF with mock data.

**Run it:**

```bash
npm run test:pdf:quick
```

or

```bash
node quick-pdf-test.js
```

**What it does:**

- Creates mock order/invoice data
- Generates a test PDF
- Verifies the PDF file was created
- Checks file size is reasonable
- Provides simple pass/fail result

**Output example:**

```
🧪 Quick PDF Generation Test

==================================================
📝 Mock Data Created:
   User: Test Company Ltd.
   Invoice: INV-TEST-1730275573123
   Order: ORD-TEST-1730275573123
   Total: 540.5 SAR

🔨 Generating PDF...
✅ PDF Generated Successfully!

📄 PDF Details:
   Path: uploads/pdfs/invoice-INV-TEST-1730275573123.pdf
   Full Path: /full/path/to/uploads/pdfs/invoice-INV-TEST-1730275573123.pdf
   Size: 45.32 KB

✅ Test Passed! PDF looks good.

💡 You can view the PDF at: /full/path/to/uploads/pdfs/invoice-INV-TEST-1730275573123.pdf
```

---

### 2. Comprehensive Test (`test-pdf-generation.js`) 🔍

**For thorough testing and debugging**

A comprehensive test suite that checks everything related to PDF generation.

**Run it:**

```bash
npm run test:pdf
```

or

```bash
node test-pdf-generation.js
```

**To test with a real order from database:**

```bash
npm run test:pdf <order-id>
```

or

```bash
node test-pdf-generation.js abc123-your-order-id
```

**What it tests:**

1. ✅ All required files exist (templates, utilities, logo)
2. ✅ Upload directory is writable
3. ✅ Database connection (optional)
4. ✅ Invoice template structure
5. ✅ PDF generation with mock data
6. ✅ PDF generation with real order (if order ID provided)

**Features:**

- Color-coded output (green for pass, red for fail)
- Detailed test results
- Summary with pass/fail counts
- Optional database testing
- Optional real order testing

---

## Which Test Should You Use?

### Use `quick-pdf-test.js` when:

- ✅ You want a fast check
- ✅ You just made changes and want to verify it still works
- ✅ You're in a hurry
- ✅ You don't need detailed diagnostics

### Use `test-pdf-generation.js` when:

- ✅ You're troubleshooting issues
- ✅ You want comprehensive checks
- ✅ You need to test with real order data
- ✅ You want detailed diagnostic information
- ✅ You're setting up a new environment

---

## Common Use Cases

### 1. Quick Verification After Code Changes

```bash
npm run test:pdf:quick
```

### 2. Full System Check

```bash
npm run test:pdf
```

### 3. Test with Real Order Data

```bash
npm run test:pdf <your-order-id>
```

### 4. Troubleshooting PDF Issues

```bash
npm run test:pdf
# Read the detailed output to see what's failing
```

---

## What Gets Generated?

Both tests create actual PDF files in the `uploads/pdfs/` directory:

- **Mock test PDFs:** `invoice-INV-TEST-{timestamp}.pdf`
- **Real order PDFs:** `invoice-{actual-invoice-number}.pdf`

The PDFs include:

- Company logo
- Invoice details
- Order items and quantities
- Addon items (if any)
- Price calculations
- VAT calculations
- ZATCA-compliant QR code
- Company and user information

---

## Troubleshooting

### "Required files not found"

- Make sure you're running from the project root directory

### "Upload directory not writable"

```bash
mkdir -p uploads/pdfs
chmod -R 755 uploads
```

### "Database connection failed" (in comprehensive test)

- This is optional - test will continue
- Check your `.env` file if you need database testing

### "PDF file size too small"

- Puppeteer might not be installed correctly
- Try: `npm install puppeteer --force`

### Puppeteer issues

If you see Chrome/Chromium errors:

```bash
# Install Puppeteer dependencies (Ubuntu/Debian)
sudo apt-get install -y \
  chromium-browser \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils
```

---

## Exit Codes

Both scripts return proper exit codes:

- `0` = Test passed ✅
- `1` = Test failed ❌

This makes them CI/CD friendly.

---

## File Structure

```
gst_backend/
├── quick-pdf-test.js           # Fast, simple test
├── test-pdf-generation.js      # Comprehensive test suite
├── TEST-PDF-README.md          # Detailed documentation
├── README-TESTING.md           # This file
├── utils/
│   ├── pdfGenerator.js         # Main PDF generation logic
│   ├── zatcaQrGenerator.js     # QR code generation
│   └── priceCalculator.js      # Price calculations
├── view/
│   └── invoice.ejs             # Invoice template
├── assets/
│   └── images/
│       └── gst-logo.png        # Company logo
└── uploads/
    └── pdfs/                   # Generated PDFs go here
```

---

## Mock Data Structure

The tests use realistic mock data:

**User:**

- Company name (English & Arabic)
- Contact information (phone, email)
- Address details

**Order:**

- Order items with products
- Addon items
- Quantities and pricing

**Invoice:**

- Invoice number
- Timestamps
- VAT calculations (15%)
- Total amounts

---

## Dependencies Required

The test scripts use:

- `puppeteer` - For PDF generation
- `ejs` - For template rendering
- `fs-extra` - For file operations
- `@prisma/client` - For database access (optional)

All these are already in your `package.json`.

---

## Tips

1. **Run the quick test first** to verify basic functionality
2. **Run the comprehensive test** if the quick test fails
3. **Keep generated PDFs** - they're useful for visual inspection
4. **Test with real orders periodically** to ensure production data works
5. **Check the uploads/pdfs folder** if you want to see the actual PDFs generated

---

## Need Help?

If tests are failing:

1. Run the comprehensive test for detailed diagnostics
2. Check the error messages - they're descriptive
3. Verify all dependencies are installed: `npm install`
4. Ensure Puppeteer is properly installed: `npm install puppeteer --force`
5. Check file permissions on the `uploads` directory
6. Verify your `.env` file has correct settings

---

## Examples

### Example 1: Daily verification

```bash
# Quick check before starting work
npm run test:pdf:quick
```

### Example 2: Before deployment

```bash
# Full test suite
npm run test:pdf

# Test with a recent order
npm run test:pdf abc123-recent-order-id
```

### Example 3: Debugging

```bash
# Run comprehensive test
npm run test:pdf

# Check the output for specific failing tests
# Fix the issues
# Run quick test to verify
npm run test:pdf:quick
```

---

## Summary

You now have **two powerful test scripts** that make it easy to verify your PDF generation is working correctly:

1. **`quick-pdf-test.js`** - Fast and simple ⚡
2. **`test-pdf-generation.js`** - Comprehensive and detailed 🔍

Both work without Jest, provide clear output, and generate actual PDFs you can inspect.

**Start with the quick test, use the comprehensive test when you need more details!**
