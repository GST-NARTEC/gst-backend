import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Cleanup old Puppeteer temporary directories
 * This is especially important on Windows IIS servers where temp files can accumulate
 */
async function cleanupPuppeteerTemp() {
  const tempBasePath = path.join(__dirname, "../uploads/temp");

  try {
    // Check if temp directory exists
    const exists = await fs.pathExists(tempBasePath);
    if (!exists) {
      console.log("No temp directory to clean up");
      return;
    }

    // Get all subdirectories in temp
    const entries = await fs.readdir(tempBasePath, { withFileTypes: true });
    const directories = entries.filter((entry) => entry.isDirectory());

    console.log(`Found ${directories.length} temp directories to clean up`);

    for (const dir of directories) {
      const dirPath = path.join(tempBasePath, dir.name);

      try {
        // Get directory stats
        const stats = await fs.stat(dirPath);
        const ageInHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);

        // Remove directories older than 1 hour
        if (ageInHours > 1) {
          console.log(
            `Removing old temp directory: ${dir.name} (${ageInHours.toFixed(
              2
            )} hours old)`
          );
          await fs.remove(dirPath);
        }
      } catch (error) {
        console.error(`Error cleaning up ${dir.name}:`, error.message);
        // Continue with other directories even if one fails
      }
    }

    console.log("Puppeteer temp cleanup completed");
  } catch (error) {
    console.error("Error during Puppeteer temp cleanup:", error.message);
  }
}

/**
 * Start periodic cleanup (runs every hour)
 */
export function startPeriodicCleanup() {
  console.log("Starting periodic Puppeteer temp cleanup (every hour)");

  // Run immediately on start
  cleanupPuppeteerTemp().catch((err) =>
    console.error("Initial cleanup failed:", err.message)
  );

  // Then run every hour
  const intervalId = setInterval(() => {
    cleanupPuppeteerTemp().catch((err) =>
      console.error("Scheduled cleanup failed:", err.message)
    );
  }, 60 * 60 * 1000); // 1 hour

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    console.log("Stopped periodic Puppeteer temp cleanup");
  };
}

export default cleanupPuppeteerTemp;
