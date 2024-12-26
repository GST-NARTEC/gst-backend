import {
  querySchema,
  countryOfOriginSaleSchema,
  countryOfOriginSaleUpdateSchema,
} from "../schemas/countryOfOriginSale.js";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class CountryOfOriginSaleController {
  static async createCountryOfOriginSale(req, res, next) {
    try {
      const { error, value } = countryOfOriginSaleSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const countryOfOriginSale = await prisma.countryOfOriginSale.create({
        data: value,
      });

      res
        .status(201)
        .json(
          response(
            201,
            true,
            "Country of origin sale created successfully",
            countryOfOriginSale
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async getCountryOfOriginSales(req, res, next) {
    try {
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { page, limit, search, sortBy, sortOrder } = value;
      const skip = (page - 1) * limit;

      const where = search
        ? {
            name: { contains: search, mode: "insensitive" },
          }
        : {};

      const [countryOfOriginSales, total] = await Promise.all([
        prisma.countryOfOriginSale.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.countryOfOriginSale.count({ where }),
      ]);

      res.json(
        response(200, true, "Country of origin sales retrieved successfully", {
          countryOfOriginSales,
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

  static async getAllCountryOfOriginSales(req, res, next) {
    try {
      const countryOfOriginSales = await prisma.countryOfOriginSale.findMany({
        orderBy: { name: "asc" },
      });

      res.json(
        response(
          200,
          true,
          "All country of origin sales retrieved successfully",
          countryOfOriginSales
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async getCountryOfOriginSale(req, res, next) {
    try {
      const { id } = req.params;

      const countryOfOriginSale = await prisma.countryOfOriginSale.findUnique({
        where: { id },
      });

      if (!countryOfOriginSale) {
        throw new MyError("Country of origin sale not found", 404);
      }

      res.json(
        response(
          200,
          true,
          "Country of origin sale retrieved successfully",
          countryOfOriginSale
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateCountryOfOriginSale(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = countryOfOriginSaleUpdateSchema.validate(
        req.body
      );
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const countryOfOriginSale = await prisma.countryOfOriginSale.update({
        where: { id },
        data: value,
      });

      res.json(
        response(
          200,
          true,
          "Country of origin sale updated successfully",
          countryOfOriginSale
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteCountryOfOriginSale(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.countryOfOriginSale.delete({
        where: { id },
      });

      res.json(
        response(200, true, "Country of origin sale deleted successfully")
      );
    } catch (error) {
      next(error);
    }
  }
}

export default CountryOfOriginSaleController;
