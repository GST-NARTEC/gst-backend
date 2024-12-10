import prisma from "../utils/prismaClient.js";
import MyError from "../utils/error.js";
import response from "../utils/response.js";
import { userProductSchema } from "../schemas/userProductSchema.js";
import { addDomain, deleteFile } from "../utils/file.js";

class UserProductsController {
  static async createProduct(req, res, next) {
    let imagePaths = [];
    try {
      const { error, value } = userProductSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { gtin, ...productData } = value;

      // Check if user exists and is authorized
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        throw new MyError("User not found", 404);
      }

      // Handle image uploads
      const imageUrls = [];
      if (req.files?.images) {
        for (const file of req.files.images) {
          const imagePath = addDomain(file.path);
          imageUrls.push(imagePath);
          imagePaths.push(imagePath);
        }
      }

      // If GTIN is provided, verify and update its status
      let gtinRecord = null;
      if (gtin) {
        gtinRecord = await prisma.gTIN.findUnique({
          where: { gtin },
        });

        if (!gtinRecord) {
          throw new MyError("Invalid GTIN provided", 400);
        }

        if (gtinRecord.usageStatus === "Used") {
          throw new MyError("This GTIN is already in use", 400);
        }
      }

      // Create product and update GTIN status in a transaction
      const newProduct = await prisma.$transaction(async (prisma) => {
        // First update GTIN status
        if (gtinRecord) {
          await prisma.gTIN.update({
            where: { gtin },
            data: {
              usageStatus: "Used",
            },
          });
        }

        // Then create product
        const product = await prisma.userProduct.create({
          data: {
            ...productData,
            gtin,
            userId: req.user.id,
            images: {
              create: imageUrls.map((url) => ({ url })),
            },
          },
          include: {
            images: true,
          },
        });

        return product;
      });

      res.status(201).json(
        response(201, true, "Product created successfully", {
          product: newProduct,
        })
      );
    } catch (error) {
      // Clean up uploaded images if there was an error
      for (const path of imagePaths) {
        await deleteFile(path);
      }
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    let imagePaths = [];
    try {
      const { id } = req.params;
      const { error, value } = userProductSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      // Remove gtin from the update data
      const { gtin: _, ...updateData } = value;

      // Check if product exists and belongs to user
      const existingProduct = await prisma.userProduct.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
        include: {
          images: true,
        },
      });

      if (!existingProduct) {
        throw new MyError("Product not found or unauthorized", 404);
      }

      // Handle image uploads
      const imageUrls = [];
      if (req.files?.images) {
        for (const file of req.files.images) {
          const imagePath = addDomain(file.path);
          imageUrls.push(imagePath);
          imagePaths.push(imagePath);
        }
      }

      // Update product (removed GTIN-related operations)
      const updatedProduct = await prisma.userProduct.update({
        where: { id },
        data: {
          ...updateData,
          images: {
            deleteMany: {},
            create: imageUrls.map((url) => ({ url })),
          },
        },
        include: {
          images: true,
        },
      });

      res.status(200).json(
        response(200, true, "Product updated successfully", {
          product: updatedProduct,
        })
      );
    } catch (error) {
      // Clean up uploaded images if there was an error
      for (const path of imagePaths) {
        await deleteFile(path);
      }
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      const product = await prisma.userProduct.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
        include: {
          images: true,
        },
      });

      if (!product) {
        throw new MyError("Product not found or unauthorized", 404);
      }

      await prisma.$transaction(async (prisma) => {
        // Delete images from storage
        for (const image of product.images) {
          await deleteFile(image.url);
        }

        // First delete all related ProductImage records
        await prisma.productImage.deleteMany({
          where: { productId: id },
        });

        // Release GTIN if exists
        if (product.gtin) {
          await prisma.gTIN.update({
            where: { gtin: product.gtin },
            data: {
              usageStatus: "Unused",
            },
          });
        }

        // Finally delete the product
        await prisma.userProduct.delete({
          where: { id },
        });
      });

      res
        .status(200)
        .json(response(200, true, "Product deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }

  static async getProduct(req, res, next) {
    try {
      const { id } = req.params;

      const product = await prisma.userProduct.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
        include: {
          images: true,
        },
      });

      if (!product) {
        throw new MyError("Product not found or unauthorized", 404);
      }

      res
        .status(200)
        .json(
          response(200, true, "Product retrieved successfully", { product })
        );
    } catch (error) {
      next(error);
    }
  }

  static async listProducts(req, res, next) {
    try {
      const { page = 1, limit = 10, search, status } = req.query;
      const skip = (page - 1) * limit;

      const whereClause = {
        userId: req.user.id,
        ...(status && { status }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { sku: { contains: search } },
            { gtin: { contains: search } },
          ],
        }),
      };

      const [products, total] = await Promise.all([
        prisma.userProduct.findMany({
          where: whereClause,
          include: {
            images: true,
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: "desc" },
        }),
        prisma.userProduct.count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        response(200, true, "Products retrieved successfully", {
          products,
          pagination: {
            total,
            page: Number(page),
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

export default UserProductsController;
