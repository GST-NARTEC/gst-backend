import { gtinQueue } from "../config/queue.js";
import {
  gtinArraySchema,
  gtinQuerySchema,
  sellGtinSchema,
} from "../schemas/gtin.schema.js";
import MyError from "../utils/error.js";
import { parseTxtFile } from "../utils/fileParser.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class GTINController {
  static async uploadGTINFile(req, res, next) {
    try {
      if (!req.file) {
        throw new MyError("No file uploaded", 400);
      }

      if (!req.file.originalname.endsWith(".txt")) {
        throw new MyError("Only .txt files are allowed", 400);
      }

      const fileContent = req.file.buffer.toString();
      const gtins = parseTxtFile(fileContent);

      if (gtins.length === 0) {
        throw new MyError("File is empty or contains no valid GTINs", 400);
      }

      // Add job to queue
      const job = await gtinQueue.add("process-gtin-file", {
        gtins,
      });

      return res.status(202).json(
        response(202, true, "GTIN processing started", {
          message: "File is being processed",
          jobId: job.id,
          gtinCount: gtins.length,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async addGTINList(req, res, next) {
    try {
      const { error, value } = gtinArraySchema.validate(req.body);
      if (error) throw new MyError(error.message, 400);

      const { gtins } = value;

      // Add job to queue
      await gtinQueue.add("process-gtin-list", {
        gtins,
      });

      return res.status(202).json(
        response(202, true, "GTIN processing started", {
          message: "GTINs are being processed",
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getGTINs(req, res, next) {
    try {
      const { error, value } = gtinQuerySchema.validate(req.query);
      if (error) throw new MyError(error.message, 400);

      const { page, limit, search, status, sortBy, sortOrder } = value;
      const skip = (page - 1) * limit;

      const where = {};
      if (search) {
        where.gtin = { contains: search };
      }
      if (status) {
        where.status = status;
      }

      const [gtins, total] = await Promise.all([
        prisma.gTIN.findMany({
          skip,
          take: limit,
          where,
          include: {
            assignedGtins: true,
          },
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.gTIN.count({ where }),
      ]);

      return res.json(
        response(200, true, "GTINs retrieved successfully", {
          gtins,
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

  static async sellGtins(req, res, next) {
    try {
      const { error, value } = sellGtinSchema.validate(req.body);
      if (error) throw new MyError(error.details[0].message, 400);

      const { totalGtins } = value;

      const randomGtins = await prisma.gTIN.findMany({
        where: { status: "Available" },
        take: totalGtins,
      });

      if (randomGtins.length < totalGtins) {
        throw new MyError(
          "Not enough available GTINs to fulfill the request",
          400
        );
      }

      // Update status of selected GTINs to "Sold"
      //   const gtinIds = randomGtins.map((gtin) => gtin.id);
      //   await prisma.gTIN.updateMany({
      //     where: { id: { in: gtinIds } },
      //     data: { status: "Sold" },
      //   });

      return res.json(
        response(200, true, "GTINs sold successfully", {
          soldGtins: randomGtins,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getGTINStats(req, res, next) {
    try {
      const stats = await prisma.gTIN.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      });

      const formattedStats = {
        Available: 0,
        Sold: 0,
        Used: 0,
      };

      stats.forEach((stat) => {
        formattedStats[stat.status] = stat._count.status;
      });

      return res.json(
        response(
          200,
          true,
          "GTIN statistics retrieved successfully",
          formattedStats
        )
      );
    } catch (error) {
      next(error);
    }
  }
}

export default GTINController;
