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
        addonIds: (() => {
          try {
            if (!req.body.addonIds) return undefined;
            if (Array.isArray(req.body.addonIds)) return req.body.addonIds;
            return JSON.parse(req.body.addonIds);
          } catch (e) {
            // If parsing fails, check if it's a string that needs to be split
            if (typeof req.body.addonIds === "string") {
              return req.body.addonIds.split(",").map((id) => id.trim());
            }
            return undefined;
          }
        })(),
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

        console.log(value.addonIds);

        if (addons.length != value.addonIds.length) {
          throw new MyError("One or more addons are invalid or inactive", 400);
        }
      }

      if (req.file) {
        imagePath = addDomain(req.file.path);
        value.image = imagePath;
      }

      const product = await prisma.product.create({
        data: {
          title: value.title,
          description: value.description,
          price: value.price,
          image: value.image,
          qty: value.qty,
          barcodeTypeId: value.barcodeTypeId
            ? {
                connect: { id: value.barcodeTypeId },
              }
            : undefined,
          status: value.status,
          category: value.categoryId
            ? {
                connect: { id: value.categoryId },
              }
            : undefined,
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
            addons: true,
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
          addons: true,
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
      const productData = {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        addonIds: (() => {
          try {
            if (!req.body.addonIds) return undefined;
            if (Array.isArray(req.body.addonIds)) return req.body.addonIds;
            return JSON.parse(req.body.addonIds);
          } catch (e) {
            // If parsing fails, check if it's a string that needs to be split
            if (typeof req.body.addonIds === "string") {
              return req.body.addonIds.split(",").map((id) => id.trim());
            }
            return undefined;
          }
        })(),
      };

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

      // check incoming file, and delete old file
      if (req.file) {
        imagePath = req.file.path;
        if (existingProduct.image) {
          deleteFile(existingProduct.image);
        }
      }

      if (value.categoryId) {
        const categoryExists = await prisma.category.findUnique({
          where: { id: value.categoryId },
        });
        if (!categoryExists) {
          throw new MyError("Category not found", 404);
        }
      }

      const updateData = {
        ...(value.title !== undefined && { title: value.title }),
        ...(value.description !== undefined && {
          description: value.description,
        }),

        ...(value.barcodeTypeId !== undefined && {
          barcodeType: {
            connect: { id: value.barcodeTypeId },
          },
        }),

        ...(value.price !== undefined && { price: value.price }),
        ...(value.status !== undefined && { status: value.status }),
        ...(value.categoryId !== undefined && {
          category: {
            connect: { id: value.categoryId },
          },
        }),
        ...(value.addonIds !== undefined && {
          addons: {
            set: value.addonIds.map((id) => ({ id })),
          },
        }),
        ...(imagePath && { image: addDomain(imagePath) }),
      };

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
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

  // Admin Dashboard
  static async getProductsCount(req, res, next) {
    try {
      const productsCount = await prisma.product.count();
      const activeProductsCount = await prisma.product.count({
        where: { status: "active" },
      });
      const inactiveProductsCount = await prisma.product.count({
        where: { status: { not: "active" } },
      });
      res.status(200).json(
        response(200, true, "Products count", {
          totalProducts: productsCount,
          activeProducts: activeProductsCount,
          inactiveProducts: inactiveProductsCount,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default ProductController;
