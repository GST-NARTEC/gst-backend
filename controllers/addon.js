import {
  addonSchema,
  addonUpdateSchema,
  querySchema,
} from "../schemas/addons.schema.js";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class AddonController {
  static async createAddon(req, res, next) {
    try {
      const { error, value } = addonSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const addon = await prisma.addon.create({
        data: value,
        include: {
          products: {
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
            },
          },
        },
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

      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { unit: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      const [addons, total] = await Promise.all([
        prisma.addon.findMany({
          where,
          include: {
            products: {
              select: {
                id: true,
                title: true,
                price: true,
                status: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.addon.count({ where }),
      ]);

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
        include: {
          products: {
            where: { status: "active" },
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
            },
          },
        },
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
