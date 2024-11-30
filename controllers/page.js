import Joi from "joi";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const pageSchema = Joi.object({
  nameEn: Joi.string().required(),
  nameAr: Joi.string().required(),
  slug: Joi.string().required(),
  template: Joi.string().required(),
});

const pageUpdateSchema = Joi.object({
  nameEn: Joi.string().optional(),
  nameAr: Joi.string().optional(),
  slug: Joi.string().optional(),
  template: Joi.string().optional(),
}).min(1);

const searchPagesSchema = Joi.object({
  search: Joi.string().allow("").optional(),
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional(),
  sortBy: Joi.string()
    .valid("nameEn", "nameAr", "createdAt")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

class PageController {
  static async createPage(req, res, next) {
    try {
      const { error, value } = pageSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const page = await prisma.page.create({
        data: value,
      });

      res
        .status(201)
        .json(response(201, true, "Page created successfully", { page }));
    } catch (error) {
      next(error);
    }
  }

  static async getPages(req, res, next) {
    try {
      const { error, value } = searchPagesSchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { search, page, limit, sortBy, sortOrder } = value;

      // Build where clause for search
      const whereClause = search
        ? {
            OR: [
              { nameEn: { contains: search } },
              { nameAr: { contains: search } },
              { slug: { contains: search } },
            ],
          }
        : {};

      // If pagination is requested
      if (page && limit) {
        const skip = (page - 1) * limit;

        const [pages, total] = await Promise.all([
          prisma.page.findMany({
            where: whereClause,
            orderBy: {
              [sortBy]: sortOrder,
            },
            skip,
            take: limit,
          }),
          prisma.page.count({ where: whereClause }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json(
          response(200, true, "Pages retrieved successfully", {
            pages,
            pagination: {
              total,
              page,
              totalPages,
              limit,
            },
          })
        );
      }

      // If no pagination requested
      const pages = await prisma.page.findMany({
        where: whereClause,
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      res
        .status(200)
        .json(response(200, true, "Pages retrieved successfully", { pages }));
    } catch (error) {
      next(error);
    }
  }

  static async getPagesByTemplate(req, res, next) {
    try {
      const { template } = req.params;

      const pages = await prisma.page.findMany({
        where: {
          template,
        },
        // include: {
        //   subMenus: true,
        // },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json(
        response(200, true, "Pages by template retrieved successfully", {
          pages,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getPage(req, res, next) {
    try {
      const { id } = req.params;

      const page = await prisma.page.findUnique({
        where: { id },
        // include: {
        //   subMenus: true,
        // },
      });

      if (!page) {
        throw new MyError("Page not found", 404);
      }

      res
        .status(200)
        .json(response(200, true, "Page retrieved successfully", { page }));
    } catch (error) {
      next(error);
    }
  }

  static async updatePage(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = pageUpdateSchema.validate(req.body);

      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const existingPage = await prisma.page.findUnique({
        where: { id },
      });

      if (!existingPage) {
        throw new MyError("Page not found", 404);
      }

      const page = await prisma.page.update({
        where: { id },
        data: value,
      });

      res
        .status(200)
        .json(response(200, true, "Page updated successfully", { page }));
    } catch (error) {
      next(error);
    }
  }

  static async deletePage(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.page.delete({
        where: { id },
      });

      res.status(200).json(response(200, true, "Page deleted successfully"));
    } catch (error) {
      next(error);
    }
  }

  static async getPageBySlug(req, res, next) {
    try {
      const { slug } = req.params;

      const page = await prisma.page.findFirst({
        where: { slug },
        include: {
          subMenus: true,
        },
      });

      if (!page) {
        throw new MyError("Page not found", 404);
      }

      res
        .status(200)
        .json(response(200, true, "Page retrieved successfully", { page }));
    } catch (error) {
      next(error);
    }
  }
}

export default PageController;
