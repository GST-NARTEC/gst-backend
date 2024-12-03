import Joi from "joi";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const addonSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  unit: Joi.string().required(),
  status: Joi.string().valid("active", "inactive").default("active"),
  stock: Joi.number().integer().min(0).default(0),
});

class AddonController {
  static async createAddon(req, res, next) {
    try {
      const { error, value } = addonSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const addon = await prisma.addon.create({
        data: value,
      });

      res
        .status(201)
        .json(response(201, true, "Addon created successfully", { addon }));
    } catch (error) {
      next(error);
    }
  }

  static async getAddons(req, res, next) {
    try {
      const addons = await prisma.addon.findMany({
        orderBy: { createdAt: "desc" },
      });

      res
        .status(200)
        .json(response(200, true, "Addons retrieved successfully", { addons }));
    } catch (error) {
      next(error);
    }
  }

  static async getActiveAddons(req, res, next) {
    try {
      const addons = await prisma.addon.findMany({
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json(
        response(200, true, "Active addons retrieved successfully", {
          addons,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteAddon(req, res, next) {
    try {
    } catch (error) {
        
      next(error);
    }
  }
}

export default AddonController;
