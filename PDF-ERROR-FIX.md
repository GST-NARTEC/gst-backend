# Puppeteer IO.read Error - Fix Documentation

## Problem

You were experiencing the following error in your Jenkins/production environment:

```
ProtocolError: Protocol error (IO.read): Read failed
```

This error occurs during PDF generation using Puppeteer in `checkoutWorker.js`.

## Root Causes

The `IO.read` error in Puppeteer typically happens due to:

1. **Memory/Resource Exhaustion** - Multiple concurrent PDF generations overwhelming the system
2. **Browser Process Crashes** - Chrome/Chromium crashes mid-operation
3. **Improper Browser Cleanup** - Zombie browser processes accumulating
4. **Network/Protocol Timeouts** - Communication between Node.js and Chrome timing out
5. **Jenkins/CI Environment Issues** - Limited resources in containerized/CI environments

## Solutions Implemented

### 1. Enhanced Puppeteer Launch Options

**What was changed:**

```javascript
const getPuppeteerLaunchOptions = (userDataDir) => ({
  headless: "new",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-web-security",
    "--disable-features=IsolateOrigins,site-per-process",
    "--single-process", // NEW: Helps prevent IO.read errors
    "--no-zygote", // NEW: Reduces memory overhead
    // ... additional stability flags
  ],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  userDataDir,
  protocolTimeout: 120000, // NEW: 2 minutes protocol timeout
});
```

**Why it helps:**

- `--single-process`: Reduces process management overhead
- `--no-zygote`: Reduces memory consumption
- `protocolTimeout`: Prevents hanging connections
- Additional flags improve stability in CI/CD environments

### 2. Proper Browser Cleanup with Finally Block

**What was changed:**

```javascript
let browser = null;
let page = null;

try {
  browser = await puppeteer.launch(getPuppeteerLaunchOptions(tempDir));
  page = await browser.newPage();

  // ... PDF generation code

  return { absolutePath, relativePath };
} finally {
  // Ensure cleanup happens even if there's an error
  try {
    if (page)
      await page.close().catch((e) => console.error("Error closing page:", e));
    if (browser)
      await browser
        .close()
        .catch((e) => console.error("Error closing browser:", e));
  } catch (cleanupError) {
    console.error("Error during cleanup:", cleanupError);
  }
}
```

**Why it helps:**

- Guarantees browser/page cleanup even on errors
- Prevents zombie processes
- Nested try-catch prevents cleanup errors from hiding original errors

### 3. Explicit Timeouts

**What was changed:**

```javascript
await page.setDefaultNavigationTimeout(60000); // 1 minute
await page.setDefaultTimeout(60000);

await page.setContent(htmlContent, {
  waitUntil: "networkidle0",
  timeout: 60000,
});

await page.pdf({
  // ... options
  timeout: 60000, // 1 minute timeout for PDF generation
});
```

**Why it helps:**

- Prevents operations from hanging indefinitely
- Fails fast with clear error messages
- Prevents resource exhaustion from stuck processes

### 4. Error Handling in CheckoutWorker

**Already implemented in your code:**

```javascript
try {
  pdfResult = await PDFGenerator.generateInvoice(
    result.order,
    user,
    result.invoice
  );

  await prisma.invoice.update({
    where: { id: result.invoice.id },
    data: { pdf: addDomain(pdfResult.relativePath) },
  });
} catch (pdfError) {
  logger.error({
    message: `PDF Generation Failed for Order ${orderNumber}`,
    stack: pdfError.stack,
    error: pdfError,
    orderNumber,
    userId: user.id,
  });

  // Continue with the process even if PDF generation fails
  console.error("PDF generation failed, continuing without PDF:", pdfError);
}
```

**Why it helps:**

- Graceful degradation - order processing continues even if PDF fails
- Proper error logging for debugging
- User still gets their order, PDF can be regenerated later

## Additional Recommendations

### 1. Environment Variables

Add to your `.env` file:

```bash
# Puppeteer Configuration
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser  # Or path to Chrome
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true  # If using system Chrome

# For Jenkins/Docker
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage
```

### 2. System Requirements (Jenkins/Production)

Ensure your Jenkins/production server has:

```bash
# Install Chrome/Chromium dependencies (Ubuntu/Debian)
sudo apt-get update
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

### 3. Memory Allocation

In Jenkins, ensure adequate memory:

```groovy
// Jenkinsfile
environment {
  NODE_OPTIONS = '--max-old-space-size=4096'  // 4GB for Node.js
}
```

### 4. Concurrency Control (Optional)

If you're generating many PDFs concurrently, consider adding a queue/semaphore:

```javascript
// utils/pdfQueue.js
import pLimit from "p-limit";

// Limit concurrent PDF generations
const limit = pLimit(2); // Maximum 2 concurrent PDF generations

export const queuePDFGeneration = (fn) => limit(fn);
```

Then wrap your PDF generation:

```javascript
import { queuePDFGeneration } from "./pdfQueue.js";

// In checkoutWorker.js
pdfResult = await queuePDFGeneration(
  async () =>
    await PDFGenerator.generateInvoice(result.order, user, result.invoice)
);
```

### 5. Docker/Container Configuration

If running in Docker, add to your `docker-compose.yml`:

```yaml
services:
  app:
    shm_size: "2gb" # Increase shared memory
    environment:
      - PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
      - PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
    cap_add:
      - SYS_ADMIN # Required for sandbox mode
```

Or in your Dockerfile:

```dockerfile
# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    # ... other dependencies

# Set Chrome path
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

## Testing

After implementing these fixes, test with:

```bash
# Quick test
npm run test:pdf:quick

# Comprehensive test
npm run test:pdf

# Test with real order
npm run test:pdf <order-id>
```

## Monitoring

Add monitoring to track PDF generation issues:

```javascript
// In your logger or monitoring system
logger.info({
  message: "PDF Generation Success",
  orderNumber,
  duration: Date.now() - startTime,
  fileSize: fs.statSync(pdfPath).size,
});
```

## Expected Results

After implementing these fixes:

✅ Reduced `IO.read` errors
✅ Better resource cleanup
✅ Faster failure detection (with timeouts)
✅ Graceful degradation (orders process even if PDF fails)
✅ Better error logging for debugging
✅ More stable in CI/CD environments

## If Issues Persist

1. **Check Chrome/Chromium version**

   ```bash
   chromium --version
   # or
   google-chrome --version
   ```

2. **Verify system resources**

   ```bash
   free -h  # Check memory
   df -h    # Check disk space
   ```

3. **Check running Chrome processes**

   ```bash
   ps aux | grep chrome
   # Kill zombie processes if found
   pkill -9 chrome
   ```

4. **Enable Puppeteer debugging**

   ```javascript
   const browser = await puppeteer.launch({
     ...getPuppeteerLaunchOptions(tempDir),
     dumpio: true, // Enable browser console output
   });
   ```

5. **Consider using a PDF generation service**
   - If issues persist, consider external services like:
     - PDFShift
     - DocRaptor
     - Cloudinary
     - AWS Lambda with Puppeteer layers

## Summary

The main issues were:

1. ❌ Missing protocol timeout
2. ❌ No explicit browser/page cleanup
3. ❌ No timeouts on PDF operations
4. ❌ Suboptimal Puppeteer flags for CI/CD

All have been fixed in the updated `pdfGenerator.js`.

The error handling in `checkoutWorker.js` was already good - it catches PDF errors and continues processing, which is the right approach for production!
