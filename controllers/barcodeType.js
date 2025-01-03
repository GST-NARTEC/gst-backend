import {
  barcodeTypeQuerySchema,
  barcodeTypeSchema,
} from "../schemas/barcodeType.schema.js";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class BarcodeTypeController {
  static async createBarcodeType(req, res, next) {
    try {
      const { error, value } = barcodeTypeSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const existingType = await prisma.barcodeType.findFirst({
        where: { type: value.type },
      });

      if (existingType) {
        throw new MyError("Barcode type already exists", 400);
      }

      const barcodeType = await prisma.barcodeType.create({
        data: value,
      });

      res.status(201).json(
        response(201, true, "Barcode type created successfully", {
          barcodeType,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getBarcodeTypes(req, res, next) {
    try {
      const { error, value } = barcodeTypeQuerySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { type } = value;
      const where = type ? { type } : {};

      const barcodeTypes = await prisma.barcodeType.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json(
        response(200, true, "Barcode types retrieved successfully", {
          barcodeTypes,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getBarcodeType(req, res, next) {
    try {
      const { id } = req.params;

      const barcodeType = await prisma.barcodeType.findUnique({
        where: { id },
      });

      if (!barcodeType) {
        throw new MyError("Barcode type not found", 404);
      }

      res.status(200).json(
        response(200, true, "Barcode type retrieved successfully", {
          barcodeType,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateBarcodeType(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = barcodeTypeSchema.validate(req.body);

      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const existingType = await prisma.barcodeType.findUnique({
        where: { id },
      });

      if (!existingType) {
        throw new MyError("Barcode type not found", 404);
      }

      // Check if new type already exists
      const duplicateType = await prisma.barcodeType.findFirst({
        where: {
          type: value.type,
          id: { not: id },
        },
      });

      if (duplicateType) {
        throw new MyError("Barcode type already exists", 400);
      }

      const barcodeType = await prisma.barcodeType.update({
        where: { id },
        data: value,
      });

      res.status(200).json(
        response(200, true, "Barcode type updated successfully", {
          barcodeType,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteBarcodeType(req, res, next) {
    try {
      const { id } = req.params;

      const barcodeType = await prisma.barcodeType.findUnique({
        where: { id },
      });

      if (!barcodeType) {
        throw new MyError("Barcode type not found", 404);
      }

      await prisma.barcodeType.delete({
        where: { id },
      });

      res
        .status(200)
        .json(response(200, true, "Barcode type deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }

  static async getBarcodeTypesWithCounts(req, res, next) {
    try {
      const [user, orders] = await Promise.all([
        prisma.user.findUnique({
          where: { id: req.user.id },
        }),
        prisma.order.findMany({
          where: { userId: req.user.id },
          include: {
            assignedGtins: {
              include: {
                barcodeType: true,
                gtin: true,
              },
            },
          },
        }),
      ]);

      if (!user) {
        throw new MyError("User not found", 404);
      }

      if (!orders || orders.length === 0) {
        throw new MyError("Orders not found", 404);
      }

      // Get all assigned GTINs and count based on status
      const barcodeTypes = {};
      
      orders.forEach(order => {
        order.assignedGtins.forEach(assignedGtin => {
          const type = assignedGtin.barcodeType?.type || "unassigned";
          
          // Initialize the type if it doesn't exist
          if (!barcodeTypes[type]) {
            barcodeTypes[type] = {
              total: 0,
              used: 0,
              available: 0
            };
          }
          
          barcodeTypes[type].total += 1;
          
          // Count based on GTIN status
          if (assignedGtin.gtin.status === "Used") {
            barcodeTypes[type].used += 1;
          } else if (assignedGtin.gtin.status === "Sold") {
            barcodeTypes[type].available += 1;
          }
        });
      });

      // Convert to final format showing only available counts
      const finalCounts = Object.entries(barcodeTypes).reduce((acc, [type, counts]) => {
        acc[type] = counts.available;
        return acc;
      }, {});

      res.status(200).json(
        response(200, true, "Barcode types retrieved successfully", {
          barcodeTypes: finalCounts,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default BarcodeTypeController;
