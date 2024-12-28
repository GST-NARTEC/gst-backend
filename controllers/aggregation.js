import { aggregationQueue } from "../config/queue.js";
import {
  aggregationSchema,
  aggregationUpdateSchema,
  querySchema,
} from "../schemas/aggregation.schema.js";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class AggregationController {
  static async createAggregation(req, res, next) {
    try {
      const { error, value } = aggregationSchema.validate(req.body);
      if (error) {
        throw new MyError(error.message, 400);
      }

      // create Qty number of records using BullMQ
      await aggregationQueue.add("aggregation", {
        gtin: value.gtin,
        batchNo: value.batchNo,
        qty: value.qty,
      });

      return res
        .status(201)
        .json(response(201, true, "Aggregation created successfully"));
    } catch (error) {
      next(error);
    }
  }

  static async getAggregations(req, res, next) {
    try {
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new MyError(error.message, 400);
      }

      const { page, limit, search, sortBy, sortOrder } = value;
      const skip = (page - 1) * limit;

      const where = {};
      if (search) {
        where.OR = [{ batchNo: { contains: search } }];
      }

      const [aggregations, total] = await Promise.all([
        prisma.aggregation.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            gtin: true,
            batchNo: true,
            serialNo: true,
            manufacturingDate: true,
            expiryDate: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.aggregation.count({ where }),
      ]);

      return res.json(
        response(200, true, "Aggregations retrieved successfully", {
          aggregations,
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

  static async updateAggregation(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = aggregationUpdateSchema.validate(req.body);
      if (error) {
        throw new MyError(error.message, 400);
      }

      const aggregation = await prisma.aggregation.update({
        where: { id },
        data: value,
      });

      return res.json(
        response(200, true, "Aggregation updated successfully", {
          aggregation,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteAggregation(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.aggregation.delete({
        where: { id },
      });

      return res.json(response(200, true, "Aggregation deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default AggregationController;
