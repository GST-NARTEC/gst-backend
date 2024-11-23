import Joi from "joi";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

// Validation schemas
const categorySchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  image: Joi.string().allow("", null),
});

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
});

class CategoryController {
  static async createCategory(req, res, next) {
    let imagePath;
    try {
      const categoryData = { ...req.body };

      const { error, value } = categorySchema.validate(categoryData);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      if (req.file) {
        imagePath = addDomain(req.file.path);
        value.image = imagePath;
      }

      const category = await prisma.category.create({
        data: value,
      });

      res.status(201).json(
        response(201, true, "Category created successfully", {
          category,
        })
      );
    } catch (error) {
      if (imagePath) {
        await deleteFile(imagePath);
      }
      next(error);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { page, limit, search } = value;
      const skip = (page - 1) * limit;

      const where = search
        ? {
            OR: [{ name: { contains: search } }],
          }
        : {};

      const [categories, total] = await Promise.all([
        prisma.category.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.category.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        response(200, true, "Categories retrieved successfully", {
          categories,
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

  static async getCategory(req, res, next) {
    try {
      const { id } = req.params;

      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new MyError("Category not found", 404);
      }

      res.status(200).json(
        response(200, true, "Category retrieved successfully", {
          category,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    let imagePath;
    try {
      const { id } = req.params;
      const categoryData = { ...req.body };

      const { error, value } = categorySchema.validate(categoryData);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const existingCategory = await prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new MyError("Category not found", 404);
      }

      if (req.file) {
        imagePath = addDomain(req.file.path);
        if (existingCategory.image) {
          await deleteFile(existingCategory.image);
        }
        value.image = imagePath;
      }

      const category = await prisma.category.update({
        where: { id },
        data: value,
      });

      res.status(200).json(
        response(200, true, "Category updated successfully", {
          category,
        })
      );
    } catch (error) {
      if (imagePath) {
        await deleteFile(imagePath);
      }
      next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;

      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new MyError("Category not found", 404);
      }

      await prisma.$transaction(async (prisma) => {
        // Set categoryId to null for all associated products
        await prisma.product.updateMany({
          where: { categoryId: id },
          data: { categoryId: null },
        });

        // Delete category image if exists
        if (category.image) {
          await deleteFile(category.image);
        }

        // Delete the category
        await prisma.category.delete({
          where: { id },
        });
      });

      res
        .status(200)
        .json(response(200, true, "Category deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }
}

export default CategoryController;
