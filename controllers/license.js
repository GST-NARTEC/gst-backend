import Joi from "joi";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const licenseSchema = Joi.object({
  license: Joi.string().required().min(3).max(100),
});

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
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
        throw new MyError("Invalid license number", 404);
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

      const existingLicense = await prisma.license.findFirst({
        where: { license: value.license },
      });

      if (existingLicense) {
        throw new MyError("License already exists", 400);
      }

      if (req.file) {
        documentPath = addDomain(req.file.path);
        value.document = documentPath;
      }

      const license = await prisma.license.create({
        data: value,
      });

      res
        .status(201)
        .json(response(201, true, "License added successfully", { license }));
    } catch (error) {
      if (documentPath) {
        await deleteFile(documentPath);
      }
      next(error);
    }
  }

  static async getLicenses(req, res, next) {
    try {
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { page, limit, search } = value;
      const skip = (page - 1) * limit;

      const where = search
        ? {
            OR: [{ license: { contains: search } }],
          }
        : {};

      const [licenses, total] = await Promise.all([
        prisma.license.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.license.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        response(200, true, "Licenses retrieved successfully", {
          licenses,
          pagination: {
            total,
            page,
            totalPages,
            hasMore: page < totalPages,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteLicense(req, res, next) {
    try {
      const { id } = req.params;

      const license = await prisma.license.findUnique({
        where: { id },
      });

      if (!license) {
        throw new MyError("License not found", 404);
      }

      if (license.document) {
        await deleteFile(license.document);
      }

      await prisma.license.delete({
        where: { id },
      });

      res
        .status(200)
        .json(response(200, true, "License deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }
}

export default LicenseController;
