// controllers/sec.js
import {
  querySchema,
  secSchema,
  secUpdateSchema,
} from "../schemas/sec.schema.js";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class SECController {
  static async createSEC(req, res, next) {
    try {
      const { error, value } = secSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        throw new MyError("User not found", 404);
      }

      if (user.secQuantity < 1) {
        throw new MyError("User has reached the maximum SEC limit", 403);
      }

      const sec = await prisma.sEC.create({
        data: {
          ...value,
          userId: req.user.id,
        },
      });

      res
        .status(201)
        .json(response(201, true, "SEC created successfully", { sec }));
    } catch (error) {
      next(error);
    }
  }

  static async getSECs(req, res, next) {
    try {
      console.log("Request query:", req.query);

      const { error, value } = querySchema.validate(req.query);
      if (error) {
        console.log("Validation error:", error);
        throw new MyError(error.details[0].message, 400);
      }

      const { page, limit, search } = value;
      const skip = (page - 1) * limit;

      console.log("Query params:", { page, limit, search, skip });

      const where = {
        userId: req.user.id,
        ...(search
          ? {
              OR: [
                { materialNo: { contains: search } },
                { purchaseOrder: { contains: search } },
                { vendor: { contains: search } },
                { serialNo: { contains: search } },
              ],
            }
          : {}),
      };

      console.log("Where clause:", where);

      const [secs, total] = await Promise.all([
        prisma.SEC.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.SEC.count({ where }),
      ]);

      console.log("Raw SECs data:", secs);
      console.log("Total count:", total);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        response(200, true, "SECs retrieved successfully", {
          secs,
          pagination: {
            total,
            page: parseInt(page),
            totalPages,
            hasMore: page < totalPages,
          },
        })
      );
    } catch (error) {
      console.error("Error in getSECs:", error);
      next(error);
    }
  }

  static async getSEC(req, res, next) {
    try {
      const { id } = req.params;

      const sec = await prisma.sEC.findUnique({
        where: {
          id,
          userId: req.user.id,
        },
        include: {
          user: true,
        },
      });

      if (!sec) {
        throw new MyError("SEC not found", 404);
      }

      res
        .status(200)
        .json(response(200, true, "SEC retrieved successfully", { sec }));
    } catch (error) {
      next(error);
    }
  }

  static async updateSEC(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = secUpdateSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const existingSEC = await prisma.sEC.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!existingSEC) {
        throw new MyError("SEC not found", 404);
      }

      const updatedSEC = await prisma.sEC.update({
        where: { id },
        data: value,
        include: {
          user: true,
        },
      });

      res
        .status(200)
        .json(
          response(200, true, "SEC updated successfully", { sec: updatedSEC })
        );
    } catch (error) {
      next(error);
    }
  }

  static async deleteSEC(req, res, next) {
    try {
      const { id } = req.params;

      const existingSEC = await prisma.sEC.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!existingSEC) {
        throw new MyError("SEC not found", 404);
      }

      await prisma.sEC.delete({
        where: { id },
      });

      res.status(200).json(response(200, true, "SEC deleted successfully"));
    } catch (error) {
      next(error);
    }
  }

  static async getSecByGtin(req, res, next) {
    try {
      const { gtin, digitalLinkType } = req.params;
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { page, limit, search } = value;
      const skip = (page - 1) * limit;

      const where = {
        gtin,
        userId: req.user.id,
        ...(search
          ? {
              OR: [
                { materialNo: { contains: search } },
                { purchaseOrder: { contains: search } },
                { vendor: { contains: search } },
                { serialNo: { contains: search } },
              ],
            }
          : {}),
      };

      const [secs, total] = await Promise.all([
        prisma.sEC.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.sEC.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        response(200, true, "SECs retrieved successfully", {
          secs,
          pagination: {
            total,
            page: parseInt(page),
            totalPages,
            hasMore: page < totalPages,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default SECController;
