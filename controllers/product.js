import Joi from "joi";
import MyError from "../utils/error.js";
import { deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

// Validation schemas
const productSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().allow("", null),
  price: Joi.number().min(0).required(),
  tax: Joi.number().min(0).default(0),
  image: Joi.string().allow("", null),
});

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
});

class ProductController {
  static async createProduct(req, res, next) {
    let imagePath;
    try {
      const productData = {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : null,
        tax: req.body.tax ? parseFloat(req.body.tax) : 0,
      };

      const { error, value } = productSchema.validate(productData);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      if (req.file) {
        imagePath = req.file.path;
        value.image = imagePath;
      }

      const product = await prisma.product.create({
        data: value,
      });

      res.status(201).json(
        response(201, true, "Product created successfully", {
          product,
        })
      );
    } catch (error) {
      if (imagePath) await deleteFile(imagePath);
      next(error);
    }
  }

  static async getProducts(req, res, next) {
    try {
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { page, limit, search } = value;
      const skip = (page - 1) * limit;

      const where = search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {};

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.product.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        response(200, true, "Products retrieved successfully", {
          products,
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

  static async getProduct(req, res, next) {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new MyError("Product not found", 404);
      }

      res.status(200).json(
        response(200, true, "Product retrieved successfully", {
          product,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    let imagePath;
    try {
      const { id } = req.params;
      const productData = {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : null,
        tax: req.body.tax ? parseFloat(req.body.tax) : 0,
      };

      const { error, value } = productSchema.validate(productData);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new MyError("Product not found", 404);
      }

      if (req.file) {
        imagePath = req.file.path;
        value.image = imagePath;
        if (existingProduct.image) {
          await deleteFile(existingProduct.image);
        }
      }

      const product = await prisma.product.update({
        where: { id },
        data: value,
      });

      res.status(200).json(
        response(200, true, "Product updated successfully", {
          product,
        })
      );
    } catch (error) {
      if (imagePath) await deleteFile(imagePath);
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new MyError("Product not found", 404);
      }

      if (product.image) {
        await deleteFile(product.image);
      }

      await prisma.product.delete({
        where: { id },
      });

      res
        .status(200)
        .json(response(200, true, "Product deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }
}

export default ProductController;
