// controllers/userGuide.js
import { userGuideSchema } from "../schemas/userGuide.schema.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class UserGuideController {
  async create(req, res, next) {
    try {
      const { error, value } = userGuideSchema.validate(req.body);
      if (error) return next(error);

      // Check if any file was uploaded
      if (!req.files || (!req.files.pdf && !req.files.video)) {
        return next(new Error("Either PDF or video file is required"));
      }

      // Handle empty file fields
      if (req.files.pdf && req.files.pdf[0].size === 0) {
        await deleteFile(req.files.pdf[0].path);
        return next(new Error("PDF file cannot be empty"));
      }

      if (req.files.video && req.files.video[0].size === 0) {
        await deleteFile(req.files.video[0].path);
        return next(new Error("Video file cannot be empty"));
      }

      // Extract only the fields that exist in Prisma schema
      const prismaData = {
        titleEn: value.titleEn,
        titleAr: value.titleAr,
        descriptionEn: value.descriptionEn,
        descriptionAr: value.descriptionAr,
      };

      // Set file type and link
      if (req.files.pdf) {
        prismaData.link = addDomain(req.files.pdf[0].path);
        prismaData.type = "pdf";
      } else if (req.files.video) {
        prismaData.link = addDomain(req.files.video[0].path);
        prismaData.type = "video";
      }

      const userGuide = await prisma.userGuide.create({
        data: prismaData,
      });

      return res
        .status(201)
        .json(response(201, true, "User guide created", userGuide));
    } catch (error) {
      // Clean up uploaded files in case of error
      if (req.files) {
        if (req.files.pdf) {
          await deleteFile(req.files.pdf[0].path);
        }
        if (req.files.video) {
          await deleteFile(req.files.video[0].path);
        }
      }
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        language = "en", // 'en' or 'ar'
        type, // pdf or video
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Build the where clause for search
      const whereClause = search
        ? {
            OR: [
              { titleEn: { contains: search } },
              { titleAr: { contains: search } },
              { descriptionEn: { contains: search } },
              { descriptionAr: { contains: search } },
            ],
          }
        : {};

      // Get total count for pagination
      const [userGuides, total] = await Promise.all([
        prisma.userGuide.findMany({
          where: {
            ...whereClause,
            type: type,
          },
          skip,
          take: Number(limit),
          orderBy: {
            [sortBy]: sortOrder.toLowerCase(),
          },
          select: {
            id: true,
            titleEn: true,
            titleAr: true,
            descriptionEn: true,
            descriptionAr: true,
            link: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.userGuide.count({ where: whereClause }),
      ]);

      // Format response based on language preference
      const formattedGuides = userGuides.map((guide) => ({
        id: guide.id,
        title: language === "ar" ? guide.titleAr : guide.titleEn,
        description:
          language === "ar" ? guide.descriptionAr : guide.descriptionEn,
        link: guide.link,
        createdAt: guide.createdAt,
        updatedAt: guide.updatedAt,
      }));

      const totalPages = Math.ceil(total / Number(limit));

      return res.json(
        response(200, true, "User guides retrieved", {
          guides: formattedGuides,
          pagination: {
            total,
            page: Number(page),
            totalPages,
            limit: Number(limit),
            hasMore: page < totalPages,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const userGuide = await prisma.userGuide.findUnique({
        where: { id: req.params.id },
      });
      if (!userGuide) return next(new Error("User guide not found"));
      return res.json(response(200, true, "User guide retrieved", userGuide));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { error, value } = userGuideSchema.validate(req.body);
      if (error) return next(error);

      const existingGuide = await prisma.userGuide.findUnique({
        where: { id: req.params.id },
      });
      if (!existingGuide) return next(new Error("User guide not found"));

      // Extract only the fields that exist in Prisma schema
      const updateData = {
        titleEn: value.titleEn,
        titleAr: value.titleAr,
        descriptionEn: value.descriptionEn,
        descriptionAr: value.descriptionAr,
      };

      // Handle file updates if provided
      if (req.files) {
        if (req.files.pdf && req.files.pdf[0].size > 0) {
          await deleteFile(existingGuide.link);
          updateData.link = addDomain(req.files.pdf[0].path);
          updateData.type = "pdf";
        } else if (req.files.video && req.files.video[0].size > 0) {
          await deleteFile(existingGuide.link);
          updateData.link = addDomain(req.files.video[0].path);
          updateData.type = "video";
        }
      }

      const userGuide = await prisma.userGuide.update({
        where: { id: req.params.id },
        data: updateData,
      });

      return res.json(response(200, true, "User guide updated", userGuide));
    } catch (error) {
      // Clean up uploaded files in case of error
      if (req.files) {
        if (req.files.pdf) {
          await deleteFile(req.files.pdf[0].path);
        }
        if (req.files.video) {
          await deleteFile(req.files.video[0].path);
        }
      }
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const userGuide = await prisma.userGuide.findUnique({
        where: { id: req.params.id },
      });
      if (!userGuide) return next(new Error("User guide not found"));

      await deleteFile(userGuide.link);

      await prisma.userGuide.delete({
        where: { id: req.params.id },
      });

      return res.json(response(200, true, "User guide deleted"));
    } catch (error) {
      next(error);
    }
  }
}

export default UserGuideController;
