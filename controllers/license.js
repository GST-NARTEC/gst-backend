import prisma from "../utils/prismaClient.js";
import MyError from "../utils/error.js";
import response from "../utils/response.js";

class LicenseController {
  static async verifyLicense(req, res, next) {
    try {
      const { licenseKey } = req.body;

      if (!licenseKey) {
        throw new MyError("License key is required", 400);
      }

      const license = await prisma.license.findFirst({
        where: {
          license: licenseKey,
        },
      });

      if (!license) {
        throw new MyError("Invalid license key", 404);
      }

      res.status(200).json(
        response(200, true, "License verified successfully", {
          license: license,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default LicenseController;
