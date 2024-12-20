import { userProductSchema } from "../schemas/userProductSchema.js";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class UserProductsController {
  static async createProduct(req, res, next) {
    let imagePaths = [];
    try {
      const { error, value } = userProductSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { gtin: _, ...productData } = value;

      let user, orders;

      [user, orders] = await Promise.all([
        prisma.user.findUnique({
          where: { id: req.user.id },
        }),

        // get all user orders
        prisma.order.findMany({
          where: {
            userId: req.user.id,
            status: "Activated",
          },
          include: {
            assignedGtins: {
              include: {
                gtin: true,
              },
            },
          },
        }),
      ]);

      if (!user) {
        throw new MyError("You are not authorized to create a product", 401);
      }

      if (orders.length < 1) {
        throw new MyError("User has no orders", 400);
      }

      let randomGtin, product;

      // now check each order one by one and check for available gtins in each order, if any order has available gtins, then pick one at random and create the product
      for (const order of orders) {
        console.log("order id", order.id);

        // find available gtin in the order
        const availableGtins = order.assignedGtins.filter(
          (gtin) => gtin.gtin?.status === "Sold"
        );

        if (availableGtins.length < 1) {
          console.log("No gtin is free in a specific order" + order.id);
          // change isSec to false in case if no gtin is free in a specific order
          await prisma.order.update({
            where: {
              id: order.id,
            },
            data: {
              isSec: false,
            },
          });
        }

        // check if it is last gtin of the order
        if (availableGtins.length === 1) {
          console.log("Last gtin of the order" + order.id);
          // update the isSec to false for this specific order
          await prisma.order.update({
            where: {
              id: order.id,
            },
            data: {
              isSec: false,
            },
          });
        }

        if (availableGtins.length > 0) {
          console.log("Available gtin in a specific order" + order.id);
          // pick a random gtin from available gtins
          randomGtin =
            availableGtins[Math.floor(Math.random() * availableGtins.length)];

          // Handle image uploads
          const imageUrls = [];
          if (req.files?.images) {
            for (const file of req.files.images) {
              const imagePath = addDomain(file.path);
              imageUrls.push(imagePath);
              imagePaths.push(imagePath);
            }
          }

          // Create product
          product = await prisma.userProduct.create({
            data: {
              ...productData,
              gtin: randomGtin.gtin.gtin,
              userId: req.user.id,
              images: {
                create: imageUrls.map((url) => ({ url })),
              },
            },
            include: {
              images: true,
            },
          });

          console.log("Product created" + product.id);

          // Update GTIN status to "Used"
          await prisma.gTIN.update({
            where: { gtin: randomGtin.gtin.gtin, status: "Sold" },
            data: {
              status: "Used",
            },
          });

          console.log("GTIN status updated to Used" + randomGtin.gtin.gtin);
          break;
        }
      }

      //   // Handle image uploads
      //   const imageUrls = [];
      //   if (req.files?.images) {
      //     for (const file of req.files.images) {
      //       const imagePath = addDomain(file.path);
      //       imageUrls.push(imagePath);
      //       imagePaths.push(imagePath);
      //     }
      //   }

      //   // Update GTIN status to "Used"
      //   await prisma.gTIN.update({
      //     where: { gtin: randomGtin.gtin.gtin, status: "Sold" },
      //     data: {
      //       status: "Used",
      //     },
      //   });

      //   // Create product
      //   const product = await prisma.userProduct.create({
      //     data: {
      //       ...productData,
      //       gtin: randomGtin.gtin.gtin,
      //       userId: req.user.id,
      //       images: {
      //         create: imageUrls.map((url) => ({ url })),
      //       },
      //     },
      //     include: {
      //       images: true,
      //     },
      //   });

      res.status(201).json(
        response(201, true, "Product created successfully", {
          product,
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

      // Find product with user verification and include necessary relations
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

      // Find the order and assigned GTIN - Modified to search all orders
      const assignedGtin = await prisma.assignedGtin.findFirst({
        where: {
          gtin: {
            gtin: product.gtin,
          },
          order: {
            userId: req.user.id,
          },
        },
        include: {
          gtin: true,
          order: true,
        },
      });

      if (!assignedGtin) {
        throw new MyError("GTIN assignment not found", 404);
      }

      await prisma.$transaction(async (prisma) => {
        // Delete physical image files from storage
        if (product.images && product.images.length > 0) {
          const deletePromises = product.images.map(async (image) => {
            try {
              await deleteFile(image.url);
            } catch (error) {
              console.error(`Failed to delete image file: ${image.url}`, error);
            }
          });
          await Promise.all(deletePromises);
        }

        // Delete all related ProductImage records from database
        await prisma.productImage.deleteMany({
          where: { productId: id },
        });

        // Release GTIN if exists - update status to "Sold"
        if (product.gtin) {
          await prisma.gTIN.update({
            where: {
              gtin: product.gtin,
              status: "Used",
            },
            data: {
              status: "Sold",
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

  static async deleteProductImage(req, res, next) {
    try {
      const { productId, imageId } = req.params;

      // Check if product exists and belongs to user
      const product = await prisma.userProduct.findFirst({
        where: {
          id: productId,
          userId: req.user.id,
        },
        include: {
          images: true,
        },
      });

      if (!product) {
        throw new MyError("Product not found or unauthorized", 404);
      }

      // Find the specific image
      const image = product.images.find((img) => img.id === imageId);
      if (!image) {
        throw new MyError("Image not found", 404);
      }

      // Delete physical file and database record
      await Promise.all([
        deleteFile(image.url),
        prisma.productImage.delete({
          where: { id: imageId },
        }),
      ]);

      res
        .status(200)
        .json(response(200, true, "Image deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }
}

export default UserProductsController;
