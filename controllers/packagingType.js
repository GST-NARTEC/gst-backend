import {
  querySchema,
  packagingTypeSchema,
  packagingTypeUpdateSchema,
} from "../schemas/packagingType.js";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class PackagingTypeController {
  static async createPackagingType(req, res, next) {
    try {
      const { error, value } = packagingTypeSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const packagingType = await prisma.packagingType.create({
        data: value,
      });

      res
        .status(201)
        .json(
          response(
            201,
            true,
            "Packaging type created successfully",
            packagingType
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async getPackagingTypes(req, res, next) {
    try {
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { page, limit, search, sortBy, sortOrder } = value;
      const skip = (page - 1) * limit;

      const where = search
        ? {
            OR: [
              { nameEn: { contains: search, mode: "insensitive" } },
              { nameAr: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      const [packagingTypes, total] = await Promise.all([
        prisma.packagingType.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.packagingType.count({ where }),
      ]);

      res.json(
        response(200, true, "Packaging types retrieved successfully", {
          packagingTypes,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAllPackagingTypes(req, res, next) {
    try {
      const packagingTypes = await prisma.packagingType.findMany({
        orderBy: { nameEn: "asc" },
      });

      res.json(
        response(
          200,
          true,
          "All packaging types retrieved successfully",
          packagingTypes
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async getPackagingType(req, res, next) {
    try {
      const { id } = req.params;

      const packagingType = await prisma.packagingType.findUnique({
        where: { id },
      });

      if (!packagingType) {
        throw new MyError("Packaging type not found", 404);
      }

      res.json(
        response(
          200,
          true,
          "Packaging type retrieved successfully",
          packagingType
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async updatePackagingType(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = packagingTypeUpdateSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const packagingType = await prisma.packagingType.update({
        where: { id },
        data: value,
      });

      res.json(
        response(
          200,
          true,
          "Packaging type updated successfully",
          packagingType
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async deletePackagingType(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.packagingType.delete({
        where: { id },
      });

      res.json(response(200, true, "Packaging type deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default PackagingTypeController;
