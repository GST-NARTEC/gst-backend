/**
 * Script to import GTINs from GST-Barcodes-612.txt
 * Skips existing barcodes and sets status to "Available" for new ones
 *
 * Usage: node scripts/gtinImport.js
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_NAME = "GST-Barcodes-612.txt";

const prisma = new PrismaClient();

const BATCH_SIZE = 500; // Process 500 records at a time

async function importGTINs() {
  try {
    // Read the text file
    const filePath = path.join(__dirname, FILE_NAME);
    const fileData = fs.readFileSync(filePath, "utf-8");
    
    // Split by newline and filter out empty lines
    const gtinRecords = fileData
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    console.log(`📦 Found ${gtinRecords.length} GTINs to process...`);
    console.log(`⚡ Using batch size of ${BATCH_SIZE} for faster processing\n`);

    // Fetch all existing GTINs in bulk for fast lookup
    console.log("🔍 Fetching existing GTINs from database...");
    const existingGtins = await prisma.gTIN.findMany({
      where: {
        gtin: { in: gtinRecords }
      },
      select: { gtin: true }
    });
    
    const existingGtinSet = new Set(existingGtins.map(g => g.gtin));
    console.log(`📋 Found ${existingGtinSet.size} existing GTINs in database\n`);

    // Filter out existing GTINs
    const newGtins = gtinRecords.filter(gtin => !existingGtinSet.has(gtin));
    const skippedCount = gtinRecords.length - newGtins.length;

    console.log(`⏭️  Skipping ${skippedCount} existing GTINs`);
    console.log(`📝 Will insert ${newGtins.length} new GTINs\n`);

    let insertedCount = 0;
    let errorCount = 0;

    // Process in batches
    const totalBatches = Math.ceil(newGtins.length / BATCH_SIZE);
    
    for (let i = 0; i < newGtins.length; i += BATCH_SIZE) {
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const batch = newGtins.slice(i, i + BATCH_SIZE);
      
      try {
        // Prepare batch data
        const batchData = batch.map(gtin => ({
          gtin: gtin,
          status: "Available",
        }));

        // Insert batch using createMany
        const result = await prisma.gTIN.createMany({
          data: batchData,
        });

        insertedCount += result.count;
        console.log(`✅ Batch ${batchNumber}/${totalBatches}: Inserted ${result.count} GTINs`);
      } catch (error) {
        errorCount += batch.length;
        console.error(`❌ Batch ${batchNumber}/${totalBatches} error:`, error.message);
      }
    }

    console.log("\n========== Summary ==========");
    console.log(`📊 Total GTINs processed: ${gtinRecords.length}`);
    console.log(`⏭️  Skipped (existing): ${skippedCount}`);
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
importGTINs();
