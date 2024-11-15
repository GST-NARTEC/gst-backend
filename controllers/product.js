import MyError from "../utils/error.js";
import response from "../utils/response.js";
import prisma from "../utils/prismaClient.js";

class ProductController {
  static async createProduct(req, res, next) {
    try {
      const { title, description, price, image } = req.body;

      const product = await prisma.product.create({
        data: {
          title,
          description,
          price: price ? parseFloat(price) : null,
          image,
        },
      });

      res.status(201).json(
        response(201, true, "Product created successfully", {
          product,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getProducts(req, res, next) {
    try {
      const { page = 1, limit = 10, search } = req.query;
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
    try {
      const { id } = req.params;
      const { title, description, price, image } = req.body;

      const product = await prisma.product.update({
        where: { id },
        data: {
          title,
          description,
          price: price ? parseFloat(price) : null,
          image,
        },
      });

      res.status(200).json(
        response(200, true, "Product updated successfully", {
          product,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

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
