import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { userGuideSchema } from "../schemas/userGuide.schema.js";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class UserGuideController {
  async create(req, res, next) {
    try {
      // Add upload progress monitoring
      req.on("progress", (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });

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
          //   select: {
          //     id: true,
          //     titleEn: true,
          //     titleAr: true,
          //     descriptionEn: true,
          //     descriptionAr: true,
          //     link: true,
          //     createdAt: true,
          //     updatedAt: true,
          //   },
        }),
        prisma.userGuide.count({
          where: {
            ...whereClause,
            type: type,
          },
        }),
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
          guides: userGuides,
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
      if (!userGuide) throw new MyError("User guide not found");
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
      if (!existingGuide) throw new MyError("User guide not found");

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
      if (!userGuide) throw new MyError("User guide not found");

      await deleteFile(userGuide.link);

      await prisma.userGuide.delete({
        where: { id: req.params.id },
      });

      return res.json(response(200, true, "User guide deleted"));
    } catch (error) {
      next(error);
    }
  }

  async uploadLargeFile(req, res, next) {
    let filePath = null;

    try {
      console.log("[Upload Started] Request received", req.files);

      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error("No file was uploaded.");
      }

      // Check for either 'file' or 'video' field
      const file = req.files.file || req.files.video;

      if (!file) {
        throw new Error("No file or video field found in the request");
      }

      console.log("[File Info]", {
        name: file.name,
        size: file.size,
        mimetype: file.mimetype,
      });

      // Generate unique ID for the file
      const fileId = uuidv4();
      const fileExt = path.extname(file.name);
      const uploadDir = "uploads/user-guide";

      // Create upload directory if it doesn't exist
      fs.mkdirSync(uploadDir, { recursive: true });

      // Set the file path
      filePath = path.join(uploadDir, `${fileId}${fileExt}`);
      console.log(`[Saving to] ${filePath}`);

      // Ensure the directory exists and is writable
      try {
        await fs.promises.access(uploadDir, fs.constants.W_OK);
      } catch (error) {
        console.log("[Directory Access Error]", error);
        // Try to create directory with explicit permissions
        await fs.promises.mkdir(uploadDir, { recursive: true, mode: 0o777 });
      }

      // Move the file with explicit error handling
      try {
        await file.mv(filePath);
        console.log("[File Saved] Successfully saved file");
      } catch (moveError) {
        console.error("[File Move Error]", moveError);
        throw new Error(`Failed to save file: ${moveError.message}`);
      }

      // Extract metadata from request body
      const metadata = {
        titleEn: req.body.titleEn || "",
        titleAr: req.body.titleAr || "",
        descriptionEn: req.body.descriptionEn || "",
        descriptionAr: req.body.descriptionAr || "",
        type: req.body.type || "video",
      };

      console.log("[Creating Database Record]", metadata);

      // Create database record
      const userGuide = await prisma.userGuide.create({
        data: {
          id: fileId,
          ...metadata,
          link: addDomain(filePath),
        },
      });

      console.log("[Database Record Created]", userGuide);

      return res
        .status(201)
        .json(
          response(201, true, "User guide created successfully", userGuide)
        );
    } catch (error) {
      console.error("[Upload Error]", error);

      // Cleanup on error
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          console.error("[Cleanup Error]", cleanupError);
        }
      }

      next(error);
    }
  }
}

export default UserGuideController;
