import {
  digitalLinkSchema,
  digitalLinkUpdateSchema,
  querySchema,
} from "../schemas/digitalLink.schema.js";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class DigitalLinkController {
  static async createDigitalLink(req, res, next) {
    try {
      const { error, value } = digitalLinkSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const digitalLink = await prisma.digitalLink.create({
        data: { ...value, userId: req.user.id },
      });

      res
        .status(201)
        .json(
          response(201, true, "Digital link created successfully", digitalLink)
        );
    } catch (error) {
      next(error);
    }
  }

  static async getDigitalLinksByGtinAndLinkType(req, res, next) {
    try {
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { gtin, digitalLinkType } = req.params;

      const existingGtin = await prisma.gTIN.findFirst({
        where: {
          gtin: gtin,
        },
      });

      if (!existingGtin) {
        throw new MyError("Gtin not found", 404);
      }

      const { page, limit, search, sortBy, sortOrder } = value;
      const skip = (page - 1) * limit;

      const where = {
        gtin,
        digitalType: digitalLinkType,
        ...(search
          ? {
              OR: [
                { url: { contains: search } },
                { digitalType: { contains: search } },
                { createdAt: { contains: search } },
              ],
            }
          : {}),
      };

      const [digitalLinks, total] = await Promise.all([
        prisma.digitalLink.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.digitalLink.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json(
        response(200, true, "Digital links retrieved successfully", {
          digitalLinks,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getDigitalLink(req, res, next) {
    try {
      const { id } = req.params;

      const digitalLink = await prisma.digitalLink.findUnique({
        where: { id },
      });

      if (!digitalLink) {
        throw new MyError("Digital link not found", 404);
      }

      res.json(
        response(200, true, "Digital link retrieved successfully", digitalLink)
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateDigitalLink(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = digitalLinkUpdateSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const digitalLink = await prisma.digitalLink.update({
        where: { id },
        data: { ...value, userId: req.user.id },
      });

      res.json(
        response(200, true, "Digital link updated successfully", digitalLink)
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteDigitalLink(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.digitalLink.delete({
        where: { id },
      });

      res.json(response(200, true, "Digital link deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default DigitalLinkController;
