import {
  productSchema,
  productUpdateSchema,
  querySchema,
} from "../schemas/product.schema.js";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class ProductController {
  static async createProduct(req, res, next) {
    let imagePath;
    try {
      const productData = {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : null,
      };

      const { error, value } = productSchema.validate(productData);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      if (value.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: value.categoryId },
        });
        if (!category) {
          throw new MyError("Category not found");
        }
      }

      // Verify addons exist if provided
      if (value.addonIds && value.addonIds.length > 0) {
        const addons = await prisma.addon.findMany({
          where: {
            id: { in: value.addonIds },
            status: "active",
          },
        });

        if (addons.length !== value.addonIds.length) {
          throw new MyError("One or more addons are invalid or inactive", 400);
        }
      }

      if (req.file) {
        imagePath = addDomain(req.file.path);
        value.image = imagePath;
      }

      const product = await prisma.product.create({
        data: {
          ...value,
          addons: value.addonIds
            ? {
                connect: value.addonIds.map((id) => ({ id })),
              }
            : undefined,
        },
        include: {
          category: true,
          addons: true,
        },
      });

      res.status(201).json(
        response(201, true, "Product created successfully", {
          product,
        })
      );
    } catch (error) {
      if (imagePath) {
        await deleteFile(imagePath);
      }
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
          include: {
            category: true,
          },
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
        include: {
          category: true,
        },
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
      const productData = {};

      // Only include fields that are actually provided
      if (req.body.title !== undefined) productData.title = req.body.title;
      if (req.body.description !== undefined)
        productData.description = req.body.description;
      if (req.body.price !== undefined)
        productData.price = parseFloat(req.body.price);
      if (req.body.categoryId !== undefined)
        productData.categoryId = req.body.categoryId || null;
      if (req.body.qty !== undefined) productData.qty = parseInt(req.body.qty);
      if (req.body.status !== undefined) productData.status = req.body.status;
      if (req.body.addonIds !== undefined)
        productData.addonIds = req.body.addonIds;

      const { error, value } = productUpdateSchema.validate(productData);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      // Verify addons exist if provided
      if (value.addonIds && value.addonIds.length > 0) {
        const addons = await prisma.addon.findMany({
          where: {
            id: { in: value.addonIds },
            status: "active",
          },
        });

        if (addons.length !== value.addonIds.length) {
          throw new MyError("One or more addons are invalid or inactive", 400);
        }
      }

      const existingProduct = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          addons: true,
        },
      });

      if (!existingProduct) {
        throw new MyError("Product not found", 404);
      }

      if (value.categoryId) {
        const categoryExists = await prisma.category.findUnique({
          where: { id: value.categoryId },
        });
        if (!categoryExists) {
          throw new MyError("Category not found", 404);
        }
      }

      if (req.file) {
        imagePath = addDomain(req.file.path);
        if (existingProduct.image) {
          await deleteFile(existingProduct.image);
        }
        value.image = imagePath;
      }

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...value,
          addons: value.addonIds
            ? {
                set: value.addonIds.map((id) => ({ id })),
              }
            : undefined,
        },
        include: {
          category: true,
          addons: true,
        },
      });

      res.status(200).json(
        response(200, true, "Product updated successfully", {
          product,
        })
      );
    } catch (error) {
      if (imagePath) {
        await deleteFile(imagePath);
      }
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

      // Only check category if categoryId exists
      if (product.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: product.categoryId },
        });

        if (!category) {
          // Just log a warning instead of throwing error
          console.warn(`Category not found for product ${id}`);
        }
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

  static async getActiveProducts(req, res, next) {
    try {
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { page, limit, search } = value;
      const skip = (page - 1) * limit;

      const where = {
        status: "active",
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {}),
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: true,
            addons: {
              where: {
                status: "active",
              },
              select: {
                id: true,
                name: true,
                price: true,
                unit: true,
                stock: true,
                status: true,
              },
            },
          },
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
        response(200, true, "Active Products retrieved successfully", {
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
}

export default ProductController;
