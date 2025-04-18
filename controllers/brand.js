import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class BrandController {
  static async createBrand(req, res, next) {
    let document;
    try {
      const { nameEn, nameAr } = req.body;
      const userId = req.user.id; // Get authenticated user's ID
      document = req.file?.path;

      const brand = await prisma.brand.create({
        data: {
          nameEn,
          nameAr,
          document: addDomain(document),
          userId,
        },
      });

      return res.status(201).json(
        response(201, true, "Brand created successfully", {
          brand,
        })
      );
    } catch (error) {
      if (document) {
        await deleteFile(document);
      }
      next(error);
    }
  }

  static async getMyBrands(req, res, next) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const userId = req.user.id;
      const skip = (page - 1) * limit;

      const where = {
        userId,
        ...(search
          ? {
              OR: [
                { nameEn: { contains: search } },
                { nameAr: { contains: search } },
              ],
            }
          : {}),
      };

      const [brands, total] = await Promise.all([
        prisma.brand.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: "desc" },
        }),
        prisma.brand.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        response(200, true, "Brands retrieved successfully", {
          brands,
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
  static async getUserBrands(req, res, next) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const userId = req.params.id;
      const skip = (page - 1) * limit;

      const where = {
        userId,
        ...(search
          ? {
              OR: [
                { nameEn: { contains: search } },
                { nameAr: { contains: search } },
              ],
            }
          : {}),
      };

      const [brands, total] = await Promise.all([
        prisma.brand.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: "desc" },
        }),
        prisma.brand.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        response(200, true, "Brands retrieved successfully", {
          brands,
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

  static async getActiveBrands(req, res, next) {
    try {
      const userId = req.user.id;
      const brands = await prisma.brand.findMany({
        where: {
          userId,
          isActive: true,
        },
        orderBy: { nameEn: "asc" },
      });

      return res.status(200).json(
        response(200, true, "Active brands retrieved successfully", {
          brands,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getBrand(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const brand = await prisma.brand.findUnique({
        where: {
          id,
          userId,
        },
      });

      if (!brand) {
        throw new MyError("Brand not found", 404);
      }

      return res.status(200).json(
        response(200, true, "Brand retrieved successfully", {
          brand,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateBrand(req, res, next) {
    let document;
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { nameEn, nameAr, isActive } = req.body;
      document = req.file?.path;

      const brand = await prisma.brand.findUnique({
        where: {
          id,
          userId,
        },
      });

      if (!brand) {
        throw new MyError("Brand not found", 404);
      }

      if (document && brand.document) {
        await deleteFile(brand.document);
      }

      const updatedBrand = await prisma.brand.update({
        where: { id },
        data: {
          nameEn,
          nameAr,
          document: document ? addDomain(document) : brand.document,
          isActive: isActive === undefined ? brand.isActive : isActive,
        },
      });

      return res.status(200).json(
        response(200, true, "Brand updated successfully", {
          brand: updatedBrand,
        })
      );
    } catch (error) {
      if (document) {
        await deleteFile(document);
      }
      next(error);
    }
  }

  static async deleteBrand(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const brand = await prisma.brand.findUnique({
        where: {
          id,
          userId,
        },
      });

      if (!brand) {
        throw new MyError("Brand not found", 404);
      }

      if (brand.document) {
        await deleteFile(brand.document);
      }

      await prisma.brand.delete({
        where: { id },
      });

      return res
        .status(200)
        .json(response(200, true, "Brand deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }
}

export default BrandController;
