import Joi from "joi";
import MyError from "../utils/error.js";
import { deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const licenseSchema = Joi.object({
  license: Joi.string().required().min(3).max(100),
});

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

  static async addLicense(req, res, next) {
    let documentPath;
    try {
      const { error, value } = licenseSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      // Check if license already exists
      const existingLicense = await prisma.license.findFirst({
        where: { license: value.license },
      });

      if (existingLicense) {
        throw new MyError("License already exists", 400);
      }

      // Handle document upload
      if (req.file) {
        documentPath = req.file.path;
      }

      // Create license record
      const license = await prisma.license.create({
        data: {
          ...value,
          document: documentPath,
        },
      });

      res
        .status(201)
        .json(response(201, true, "License added successfully", { license }));
    } catch (error) {
      // Clean up uploaded file if there's an error
      if (documentPath) {
        await deleteFile(documentPath);
      }
      next(error);
    }
  }
}

export default LicenseController;
