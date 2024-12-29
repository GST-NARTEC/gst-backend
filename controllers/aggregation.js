import { aggregationQueue } from "../config/queue.js";
import {
  aggregationSchema,
  aggregationUpdateSchema,
  querySchema,
} from "../schemas/aggregation.schema.js";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const calculateSerialNo = async (gtin, batch, id) => {
  // last 10 digits of gtin
  const gtinLast10 = gtin.slice(-10);

  // concate gtinLast10 with batch and id along with dashes
  const serialNo = `${gtinLast10}-${batch}-${id}`;

  return serialNo;
};

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
        calculateSerialNo,
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

      const { page, limit, search, sortBy, sortOrder, gtin } = value;
      const skip = (page - 1) * limit;

      const where = {};
      if (search) {
        where.OR = [{ batchNo: { contains: search } }];
      }

      if (gtin) {
        where.gtin = { contains: gtin };
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

      const existingAggrigation = await prisma.aggregation.findFirst({
        where: { id: Number(id) },
      });

      const serialNo = await calculateSerialNo(
        existingAggrigation.gtin,
        value.batchNo || existingAggrigation.batchNo,
        id
      );

      const aggregation = await prisma.aggregation.update({
        where: { id: Number(id) },
        data: { ...value, serialNo },
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
        where: { id: Number(id) },
      });

      return res.json(response(200, true, "Aggregation deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default AggregationController;
