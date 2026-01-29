import Joi from "joi";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const createFileSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
});

const updateFileSchema = Joi.object({
  name: Joi.string().min(1).max(255),
  isActive: Joi.boolean(),
});

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
  isActive: Joi.string().valid("all", "true", "false").default("all"),
  sortBy: Joi.string().valid("createdAt", "name").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

class FileController {
  /**
   * Upload a new file
   * POST /api/v1/files
   */
  static async uploadFile(req, res, next) {
    let filePath;
    try {
      const { error, value } = createFileSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      if (!req.file) {
        throw new MyError("File is required", 400);
      }

      // Validate file type (PDF or Word documents)
      const allowedMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        throw new MyError(
          "Invalid file type. Only PDF and Word documents are allowed",
          400
        );
      }

      // Add domain to file path
      filePath = addDomain(req.file.path);

      const file = await prisma.file.create({
        data: {
          name: value.name,
          path: filePath,
          mimeType: req.file.mimetype,
          size: req.file.size,
        },
      });

      res.status(201).json(
        response(201, true, "File uploaded successfully", { file })
      );
    } catch (error) {
      // Clean up uploaded file if there's an error
      if (filePath) {
        await deleteFile(filePath);
      }
      next(error);
    }
  }

  /**
   * Get all files with pagination
   * GET /api/v1/files
   */
  static async getFiles(req, res, next) {
    try {
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { page, limit, search, isActive, sortBy, sortOrder } = value;
      const skip = (page - 1) * limit;

      // Build where clause
      const where = {};

      if (search) {
        where.name = { contains: search };
      }

      if (isActive !== "all") {
        where.isActive = isActive === "true";
      }

      const [files, total] = await Promise.all([
        prisma.file.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.file.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        response(200, true, "Files retrieved successfully", {
          files,
          pagination: {
            total,
            page,
            limit,
            totalPages,
            hasMore: page < totalPages,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single file by ID
   * GET /api/v1/files/:id
   */
  static async getFileById(req, res, next) {
    try {
      const { id } = req.params;

      const file = await prisma.file.findUnique({
        where: { id },
      });

      if (!file) {
        throw new MyError("File not found", 404);
      }

      res.status(200).json(
        response(200, true, "File retrieved successfully", { file })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a file (name or status)
   * PUT /api/v1/files/:id
   */
  static async updateFile(req, res, next) {
    let newFilePath;
    try {
      const { id } = req.params;
      const { error, value } = updateFileSchema.validate(req.body);

      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const existingFile = await prisma.file.findUnique({
        where: { id },
      });

      if (!existingFile) {
        throw new MyError("File not found", 404);
      }

      const updateData = { ...value };

      // If a new file is uploaded, replace the old one
      if (req.file) {
        // Validate file type
        const allowedMimeTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!allowedMimeTypes.includes(req.file.mimetype)) {
          throw new MyError(
            "Invalid file type. Only PDF and Word documents are allowed",
            400
          );
        }

        newFilePath = addDomain(req.file.path);
        updateData.path = newFilePath;
        updateData.mimeType = req.file.mimetype;
        updateData.size = req.file.size;

        // Delete old file
        if (existingFile.path) {
          await deleteFile(existingFile.path);
        }
      }

      const updatedFile = await prisma.file.update({
        where: { id },
        data: updateData,
      });

      res.status(200).json(
        response(200, true, "File updated successfully", { file: updatedFile })
      );
    } catch (error) {
      // Clean up new file if there's an error
      if (newFilePath) {
        await deleteFile(newFilePath);
      }
      next(error);
    }
  }

  /**
   * Delete a file
   * DELETE /api/v1/files/:id
   */
  static async deleteFile(req, res, next) {
    try {
      const { id } = req.params;

      const file = await prisma.file.findUnique({
        where: { id },
      });

      if (!file) {
        throw new MyError("File not found", 404);
      }

      // Delete the physical file
      if (file.path) {
        await deleteFile(file.path);
      }

      // Delete from database
      await prisma.file.delete({
        where: { id },
      });

      res.status(200).json(
        response(200, true, "File deleted successfully", null)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle file active status
   * PATCH /api/v1/files/:id/toggle-status
   */
  static async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;

      const file = await prisma.file.findUnique({
        where: { id },
      });

      if (!file) {
        throw new MyError("File not found", 404);
      }

      const updatedFile = await prisma.file.update({
        where: { id },
        data: { isActive: !file.isActive },
      });

      res.status(200).json(
        response(200, true, "File status updated successfully", {
          file: updatedFile,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default FileController;
