import {
  querySchema,
  udiSchema,
  udiUpdateSchema,
} from "../schemas/udi.schema.js";
import calculateSerialNo from "../utils/calculateSerial.js";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class UDIController {
  static async createUDI(req, res, next) {
    try {
      const { error, value } = udiSchema.validate(req.body);
      if (error) {
        throw new MyError(error.message, 400);
      }

      const { gtin, batchNo, expiryDate } = value;

      const udi = await prisma.uDI.create({
        data: {
          gtin,
          batchNo,
          expiryDate,
          userId: req.user.id,
        },
      });

      const serialNo = await calculateSerialNo(gtin, batchNo, udi.id);

      await prisma.uDI.update({
        where: { id: udi.id },
        data: { serialNo },
      });

      return res
        .status(201)
        .json(response(201, true, "UDI created successfully", udi));
    } catch (error) {
      next(error);
    }
  }

  static async getUDIs(req, res, next) {
    try {
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new MyError(error.message, 400);
      }

      const { page, limit, search, sortBy, sortOrder, gtin } = value;
      const skip = (page - 1) * limit;

      const where = {};
      if (search) {
        where.OR = [{ batchNo: { contains: search } }];
      }

      if (gtin) {
        where.gtin = { contains: gtin };
      }

      const [udis, total] = await Promise.all([
        prisma.uDI.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            gtin: true,
            batchNo: true,
            serialNo: true,
            expiryDate: true,
            createdAt: true,
            updatedAt: true,
          },
          //   orderBy: { [sortBy]: sortOrder },
          orderBy: { gtin: "asc" },
        }),
        prisma.uDI.count({ where }),
      ]);

      return res.json(
        response(200, true, "UDIs retrieved successfully", {
          udis,
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

  static async updateUDI(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = udiUpdateSchema.validate(req.body);
      if (error) {
        throw new MyError(error.message, 400);
      }

      const existingUDI = await prisma.uDI.findFirst({
        where: { id: Number(id) },
      });

      if (!existingUDI) {
        throw new MyError("No UDI found with this ID!");
      }

      if (existingUDI.userId && existingUDI.userId != req.user.id) {
        throw new MyError("You are not authorized to update this UDI");
      }

      const serialNo = await calculateSerialNo(
        existingUDI.gtin,
        value.batchNo || existingUDI.batchNo,
        id
      );

      const udi = await prisma.uDI.update({
        where: { id: Number(id) },
        data: { ...value, serialNo },
      });

      return res.json(
        response(200, true, "UDI updated successfully", {
          udi,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteUDI(req, res, next) {
    try {
      const { id } = req.params;

      const existingUDI = await prisma.uDI.findFirst({
        where: { id: Number(id) },
      });

      if (!existingUDI) {
        throw new MyError("No UDI found with this ID!");
      }

      if (existingUDI.userId && existingUDI.userId != req.user.id) {
        throw new MyError("You are not authorized to delete this UDI");
      }

      await prisma.uDI.delete({
        where: { id: Number(id) },
      });

      return res.json(response(200, true, "UDI deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default UDIController;
