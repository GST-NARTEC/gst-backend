import {
  querySchema,
  productTypeSchema,
  productTypeUpdateSchema,
} from "../schemas/productType.js";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class ProductTypeController {
  static async createProductType(req, res, next) {
    try {
      const { error, value } = productTypeSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const productType = await prisma.productType.create({
        data: value,
      });

      res
        .status(201)
        .json(
          response(201, true, "Product type created successfully", productType)
        );
    } catch (error) {
      next(error);
    }
  }

  static async getProductTypes(req, res, next) {
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

      const [productTypes, total] = await Promise.all([
        prisma.productType.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.productType.count({ where }),
      ]);

      res.json(
        response(200, true, "Product types retrieved successfully", {
          productTypes,
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

  static async getAllProductTypes(req, res, next) {
    try {
      const productTypes = await prisma.productType.findMany({
        orderBy: { nameEn: "asc" },
      });

      res.json(
        response(
          200,
          true,
          "All product types retrieved successfully",
          productTypes
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async getProductType(req, res, next) {
    try {
      const { id } = req.params;

      const productType = await prisma.productType.findUnique({
        where: { id },
      });

      if (!productType) {
        throw new MyError("Product type not found", 404);
      }

      res.json(
        response(200, true, "Product type retrieved successfully", productType)
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateProductType(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = productTypeUpdateSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const productType = await prisma.productType.update({
        where: { id },
        data: value,
      });

      res.json(
        response(200, true, "Product type updated successfully", productType)
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteProductType(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.productType.delete({
        where: { id },
      });

      res.json(response(200, true, "Product type deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default ProductTypeController;
