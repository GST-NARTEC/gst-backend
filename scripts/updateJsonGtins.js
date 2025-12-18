/**
 * Script to update Oscar Paints GTIN statuses to "Sold"
 * If a GTIN doesn't exist, it will be inserted with "Sold" status
 *
 * Usage: node scripts/updateOscarPaintsGtins.js
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_NAME = "gtins_ORD2507.json";

const prisma = new PrismaClient();

async function updateOscarPaintsGtins() {
  try {
    // Read the JSON file
    const jsonPath = path.join(__dirname, FILE_NAME);
    const jsonData = fs.readFileSync(jsonPath, "utf-8");
    const gtinRecords = JSON.parse(jsonData);

    console.log(`📦 Found ${gtinRecords.length} GTINs to process...\n`);

    let updatedCount = 0;
    let insertedCount = 0;
    let errorCount = 0;

    // Process each GTIN using upsert
    for (const record of gtinRecords) {
      try {
        const result = await prisma.gTIN.upsert({
          where: { gtin: record.gtin },
          update: { status: "Sold" },
          create: {
            gtin: record.gtin,
            status: "Sold",
          },
        });

        // Check if it was an update or insert by checking createdAt vs updatedAt
        // If the difference is very small (< 1 second), it was likely just created
        const timeDiff = Math.abs(
          result.updatedAt.getTime() - result.createdAt.getTime()
        );
        if (timeDiff < 1000) {
          insertedCount++;
          console.log(`✅ Inserted: ${record.gtin}`);
        } else {
          updatedCount++;
          console.log(`🔄 Updated: ${record.gtin}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing GTIN ${record.gtin}:`, error.message);
      }
    }

    console.log("\n========== Summary ==========");
    console.log(`📊 Total GTINs processed: ${gtinRecords.length}`);
    console.log(`🔄 Updated: ${updatedCount}`);
    console.log(`✅ Inserted: ${insertedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log("=============================\n");
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateOscarPaintsGtins();
