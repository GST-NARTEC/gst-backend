import Joi from "joi";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

// Validation schemas
const createExhibitVisitorSchema = Joi.object({
  name: Joi.string().allow("", null).max(255),
  email: Joi.string().email().allow("", null).max(255),
  phone: Joi.string().allow("", null).max(50),
  company: Joi.string().allow("", null).max(255),
});

const updateExhibitVisitorSchema = Joi.object({
  name: Joi.string().allow("", null).max(255),
  email: Joi.string().email().allow("", null).max(255),
  phone: Joi.string().allow("", null).max(50),
  company: Joi.string().allow("", null).max(255),
});

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
  name: Joi.string().allow("", null),
  email: Joi.string().allow("", null),
  phone: Joi.string().allow("", null),
  company: Joi.string().allow("", null),
});

const idParamSchema = Joi.object({
  id: Joi.string().required(),
});

class ExhibitVisitorController {
  /**
   * Create a new exhibit visitor
   * POST /exhibit-visitors
   */
  static async createExhibitVisitor(req, res, next) {
    try {
      const { error, value } = createExhibitVisitorSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const exhibitVisitor = await prisma.exhibitVisitor.create({
        data: value,
      });

      res.status(201).json(
        response(201, true, "Exhibit visitor created successfully", {
          exhibitVisitor,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all exhibit visitors with pagination and search
   * GET /exhibit-visitors
   * Query params: page, limit, search, name, email, phone, company
   */
  static async getExhibitVisitors(req, res, next) {
    try {
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { page, limit, search, name, email, phone, company } = value;
      const skip = (page - 1) * limit;

      // Build the where clause with partial search
      const whereConditions = [];

      // Global search across all fields
      if (search) {
        whereConditions.push({
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
            { company: { contains: search } },
          ],
        });
      }

      // Specific field searches
      if (name) {
        whereConditions.push({
          name: { contains: name },
        });
      }
      if (email) {
        whereConditions.push({
          email: { contains: email },
        });
      }
      if (phone) {
        whereConditions.push({
          phone: { contains: phone },
        });
      }
      if (company) {
        whereConditions.push({
          company: { contains: company },
        });
      }

      const where =
        whereConditions.length > 0 ? { AND: whereConditions } : {};

      const [exhibitVisitors, total] = await Promise.all([
        prisma.exhibitVisitor.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.exhibitVisitor.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        response(200, true, "Exhibit visitors retrieved successfully", {
          exhibitVisitors,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages,
            hasMore: page < totalPages,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all exhibit visitors (without pagination and search)
   * GET /exhibit-visitors/all
   */
  static async getAllExhibitVisitors(req, res, next) {
    try {
      const exhibitVisitors = await prisma.exhibitVisitor.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json(
        response(200, true, "Exhibit visitors retrieved successfully", {
          exhibitVisitors,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single exhibit visitor by ID
   * GET /exhibit-visitors/:id
   */
  static async getExhibitVisitor(req, res, next) {
    try {
      const { error } = idParamSchema.validate(req.params);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { id } = req.params;

      const exhibitVisitor = await prisma.exhibitVisitor.findUnique({
        where: { id },
      });

      if (!exhibitVisitor) {
        throw new MyError("Exhibit visitor not found", 404);
      }

      res.status(200).json(
        response(200, true, "Exhibit visitor retrieved successfully", {
          exhibitVisitor,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an exhibit visitor
   * PUT /exhibit-visitors/:id
   */
  static async updateExhibitVisitor(req, res, next) {
    try {
      const { error: paramError } = idParamSchema.validate(req.params);
      if (paramError) {
        throw new MyError(paramError.details[0].message, 400);
      }

      const { error, value } = updateExhibitVisitorSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { id } = req.params;

      const existingVisitor = await prisma.exhibitVisitor.findUnique({
        where: { id },
      });

      if (!existingVisitor) {
        throw new MyError("Exhibit visitor not found", 404);
      }

      const exhibitVisitor = await prisma.exhibitVisitor.update({
        where: { id },
        data: value,
      });

      res.status(200).json(
        response(200, true, "Exhibit visitor updated successfully", {
          exhibitVisitor,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an exhibit visitor
   * DELETE /exhibit-visitors/:id
   */
  static async deleteExhibitVisitor(req, res, next) {
    try {
      const { error } = idParamSchema.validate(req.params);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { id } = req.params;

      const exhibitVisitor = await prisma.exhibitVisitor.findUnique({
        where: { id },
      });

      if (!exhibitVisitor) {
        throw new MyError("Exhibit visitor not found", 404);
      }

      await prisma.exhibitVisitor.delete({
        where: { id },
      });

      res
        .status(200)
        .json(response(200, true, "Exhibit visitor deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get total count of exhibit visitors
   * GET /exhibit-visitors/count
   */
  static async getExhibitVisitorsCount(req, res, next) {
    try {
      const count = await prisma.exhibitVisitor.count();
      res
        .status(200)
        .json(response(200, true, "Exhibit visitors count", { count }));
    } catch (error) {
      next(error);
    }
  }
}

export default ExhibitVisitorController;
