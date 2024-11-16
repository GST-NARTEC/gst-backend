import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

// Get the directory name from the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // Read the licenses from the licenses.txt file
  const filePath = path.join(__dirname, "licenses.txt");
  const data = fs.readFileSync(filePath, "utf-8");

  // Split the data into an array of licenses
  const licenses = data
    .split("\n")
    .map((line) => line.trim()) // Trim whitespace from each line
    .filter((license) => license); // Filter out any empty lines

  // Check if the license model is defined
  const licenseModel = await prisma.license.findMany();
  if (!licenseModel) {
    console.error("License model is not defined in Prisma client.");
    return;
  }

  let count = 0; // Initialize a counter for the number of seeds

  // Insert each license into the database
  for (const license of licenses) {
    try {
      await prisma.license.create({
        data: {
          license: license, // Store the license number in the 'license' field
        },
      });
      count++; // Increment the counter

      // Log progress every 100 seeds
      if (count % 100 === 0) {
        console.log(`${count} seeds done.`);
      }
    } catch (error) {
      console.error(`Failed to insert license ${license}:`, error);
    }
  }

  console.log("Licenses seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
