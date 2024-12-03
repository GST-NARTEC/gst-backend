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
  productIds: Joi.array().items(Joi.string().uuid()).optional(),
});

const addonUpdateSchema = Joi.object({
  name: Joi.string(),
  price: Joi.number().min(0),
  unit: Joi.string(),
  status: Joi.string().valid("active", "inactive"),
  stock: Joi.number().integer().min(0),
  productIds: Joi.array().items(Joi.string().uuid()),
}).min(1);

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
  sortBy: Joi.string().valid("name", "price", "createdAt").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
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
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { page, limit, search, sortBy, sortOrder } = value;
      const skip = (page - 1) * limit;

      // Build where clause for search
      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { unit: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      // Get total count for pagination
      const total = await prisma.addon.count({ where });

      // Get paginated results
      const addons = await prisma.addon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      });

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        response(200, true, "Addons retrieved successfully", {
          addons,
          pagination: {
            total,
            page,
            totalPages,
            limit,
          },
        })
      );
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

  static async updateAddon(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = addonUpdateSchema.validate(req.body, {
        stripUnknown: true,
      });

      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const existingAddon = await prisma.addon.findUnique({
        where: { id },
      });

      if (!existingAddon) {
        throw new MyError("Addon not found", 404);
      }

      const addon = await prisma.addon.update({
        where: { id },
        data: value,
      });

      res
        .status(200)
        .json(response(200, true, "Addon updated successfully", { addon }));
    } catch (error) {
      if (error.code === "P2025") {
        next(new MyError("Addon not found", 404));
      } else {
        next(error);
      }
    }
  }

  static async deleteAddon(req, res, next) {
    try {
      const { id } = req.params;

      const addon = await prisma.addon.delete({
        where: { id },
      });

      if (!addon) {
        throw new MyError("Addon not found", 404);
      }

      res
        .status(200)
        .json(response(200, true, "Addon deleted successfully", { addon }));
    } catch (error) {
      if (error.code === "P2025") {
        next(new MyError("Addon not found", 404));
      } else {
        next(error);
      }
    }
  }
}

export default AddonController;
