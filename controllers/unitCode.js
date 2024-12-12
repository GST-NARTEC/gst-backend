// controllers/unitCode.js
import {
  querySchema,
  unitCodeSchema,
  unitCodeUpdateSchema,
} from "../schemas/unitCode.prisma.js";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class UnitCodeController {
  static async createUnitCode(req, res, next) {
    try {
      const { error, value } = unitCodeSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const unitCode = await prisma.unitCode.create({
        data: value,
      });

      res
        .status(201)
        .json(response(201, true, "Unit code created successfully", unitCode));
    } catch (error) {
      next(error);
    }
  }

  static async getUnitCodes(req, res, next) {
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
              { code: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      const [unitCodes, total] = await Promise.all([
        prisma.unitCode.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.unitCode.count({ where }),
      ]);

      res.json(
        response(200, true, "Unit codes retrieved successfully", {
          unitCodes,
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

  static async getAllUnitCodes(req, res, next) {
    try {
      const unitCodes = await prisma.unitCode.findMany({
        orderBy: { code: "asc" },
      });

      res.json(
        response(200, true, "All unit codes retrieved successfully", unitCodes)
      );
    } catch (error) {
      next(error);
    }
  }

  static async getUnitCode(req, res, next) {
    try {
      const { id } = req.params;

      const unitCode = await prisma.unitCode.findUnique({
        where: { id },
      });

      if (!unitCode) {
        throw new MyError("Unit code not found", 404);
      }

      res.json(
        response(200, true, "Unit code retrieved successfully", unitCode)
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateUnitCode(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = unitCodeUpdateSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const unitCode = await prisma.unitCode.update({
        where: { id },
        data: value,
      });

      res.json(response(200, true, "Unit code updated successfully", unitCode));
    } catch (error) {
      next(error);
    }
  }

  static async deleteUnitCode(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.unitCode.delete({
        where: { id },
      });

      res.json(response(200, true, "Unit code deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default UnitCodeController;
