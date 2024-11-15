import { PrismaClient } from "@prisma/client";
import MyError from "../utils/error.js";

const prisma = new PrismaClient();

class License {
  static async verifyLicense(licenseKey) {
    try {
      const license = await prisma.license.findFirst({
        where: {
          license: licenseKey,
        },
      });

      if (!license) {
        throw new MyError("Invalid license key", 404);
      }

      return license;
    } catch (error) {
      if (error instanceof MyError) {
        throw error;
      }
      throw new MyError("Error verifying license", 500);
    }
  }
}

export default License;
