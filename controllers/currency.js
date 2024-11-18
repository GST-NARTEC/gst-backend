import Joi from "joi";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

// Validation schema
const currencySchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  symbol: Joi.string().required().min(1).max(10),
});

class CurrencyController {
  static async createCurrency(req, res, next) {
    try {
      const { error, value } = currencySchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const currency = await prisma.currency.create({
        data: value,
      });

      res
        .status(201)
        .json(
          response(201, true, "Currency created successfully", { currency })
        );
    } catch (error) {
      next(error);
    }
  }

  static async getCurrencies(req, res, next) {
    try {
      const currencies = await prisma.currency.findMany({
        orderBy: { createdAt: "desc" },
      });

      res
        .status(200)
        .json(
          response(200, true, "Currencies retrieved successfully", {
            currencies,
          })
        );
    } catch (error) {
      next(error);
    }
  }

  static async getCurrency(req, res, next) {
    try {
      const { id } = req.params;

      const currency = await prisma.currency.findUnique({
        where: { id },
      });

      if (!currency) {
        throw new MyError("Currency not found", 404);
      }

      res
        .status(200)
        .json(
          response(200, true, "Currency retrieved successfully", { currency })
        );
    } catch (error) {
      next(error);
    }
  }

  static async updateCurrency(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = currencySchema.validate(req.body);

      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const currency = await prisma.currency.update({
        where: { id },
        data: value,
      });

      res
        .status(200)
        .json(
          response(200, true, "Currency updated successfully", { currency })
        );
    } catch (error) {
      next(error);
    }
  }

  static async deleteCurrency(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.currency.delete({
        where: { id },
      });

      res
        .status(200)
        .json(response(200, true, "Currency deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }
}

export default CurrencyController;
