import Joi from "joi";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const vatSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  taxId: Joi.string().allow("", null),
  isActive: Joi.boolean().required(),
  description: Joi.string().allow("", null),
  value: Joi.number().required().min(0),
  type: Joi.string().valid("PERCENTAGE", "FIXED").required(),
});

class VatController {
  static async createVat(req, res, next) {
    try {
      const { error, value } = vatSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const vat = await prisma.vat.create({
        data: value,
      });

      res
        .status(201)
        .json(response(201, true, "VAT created successfully", { vat }));
    } catch (error) {
      next(error);
    }
  }

  static async getVats(req, res, next) {
    try {
      const vats = await prisma.vat.findMany({
        orderBy: { createdAt: "desc" },
      });

      res
        .status(200)
        .json(response(200, true, "VATs retrieved successfully", { vats }));
    } catch (error) {
      next(error);
    }
  }

  static async getVat(req, res, next) {
    try {
      const { id } = req.params;

      const vat = await prisma.vat.findUnique({
        where: { id },
      });

      if (!vat) {
        throw new MyError("VAT not found", 404);
      }

      res
        .status(200)
        .json(response(200, true, "VAT retrieved successfully", { vat }));
    } catch (error) {
      next(error);
    }
  }

  static async updateVat(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = vatSchema.validate(req.body);

      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const vat = await prisma.vat.update({
        where: { id },
        data: value,
      });

      res
        .status(200)
        .json(response(200, true, "VAT updated successfully", { vat }));
    } catch (error) {
      next(error);
    }
  }

  static async deleteVat(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.vat.delete({
        where: { id },
      });

      res
        .status(200)
        .json(response(200, true, "VAT deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }
}

export default VatController;
