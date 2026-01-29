import Joi from "joi";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const smartSolutionSchema = Joi.object({
  titleEn: Joi.string().allow("", null),
  titleAr: Joi.string().allow("", null),
  descriptionEn: Joi.string().allow("", null),
  descriptionAr: Joi.string().allow("", null),
  date: Joi.date().allow(null),
  image: Joi.string().allow("", null),
  captionEn: Joi.string().allow("", null),
  captionAr: Joi.string().allow("", null),
  isActive: Joi.boolean().default(true),
  pageId: Joi.string().allow("", null),
  externalUrl: Joi.string().uri().allow("", null),
});

class SmartSolutionController {
  static async createSmartSolution(req, res, next) {
    let imagePath;
    try {
      const { error, value } = smartSolutionSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      if (value.pageId) {
        const page = await prisma.page.findUnique({
          where: { id: value.pageId },
        });
        if (!page) {
          throw new MyError("Referenced page not found", 404);
        }
      }

      if (req.file) {
        imagePath = addDomain(req.file.path);
        value.image = imagePath;
      }

      const smartSolution = await prisma.smartSolution.create({ data: value });

      res.status(201).json(
        response(201, true, "Smart Solution created successfully", {
          smartSolution,
        })
      );
    } catch (error) {
      if (imagePath) {
        await deleteFile(imagePath);
      }
      next(error);
    }
  }

  static async getSmartSolutions(req, res, next) {
    try {
      const smartSolutions = await prisma.smartSolution.findMany({
        include: { page: true },
        orderBy: { createdAt: "asc" },
      });

      res.status(200).json(
        response(200, true, "Smart Solutions retrieved successfully", {
          smartSolutions,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getSmartSolution(req, res, next) {
    try {
      const { id } = req.params;
      const smartSolution = await prisma.smartSolution.findUnique({
        where: { id },
        include: { page: true },
      });
      if (!smartSolution) {
        throw new MyError("Smart Solution not found", 404);
      }
      res.status(200).json(
        response(200, true, "Smart Solution retrieved successfully", {
          smartSolution,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateSmartSolution(req, res, next) {
    let imagePath;
    try {
      const { id } = req.params;
      const { error, value } = smartSolutionSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      if (value.pageId) {
        value.externalUrl = null;
      } else if (value.externalUrl) {
        value.pageId = null;
      }

      const existingSmartSolution = await prisma.smartSolution.findUnique({
        where: { id },
        include: { page: true },
      });
      if (!existingSmartSolution) {
        throw new MyError("Smart Solution not found", 404);
      }

      if (req.file) {
        imagePath = addDomain(req.file.path);
        if (existingSmartSolution.image) {
          await deleteFile(existingSmartSolution.image);
        }
        value.image = imagePath;
      }

      const smartSolution = await prisma.smartSolution.update({
        where: { id },
        data: value,
      });

      res.status(200).json(
        response(200, true, "Smart Solution updated successfully", {
          smartSolution,
        })
      );
    } catch (error) {
      if (imagePath) {
        await deleteFile(imagePath);
      }
      next(error);
    }
  }

  static async getActiveSmartSolutions(req, res, next) {
    try {
      const smartSolutions = await prisma.smartSolution.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: { page: true },
      });
      res.status(200).json(
        response(200, true, "Active Smart Solutions retrieved successfully", {
          smartSolutions,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteSmartSolution(req, res, next) {
    try {
      const { id } = req.params;
      const existingSmartSolution = await prisma.smartSolution.findUnique({
        where: { id },
        include: { page: true },
      });
      if (!existingSmartSolution) {
        throw new MyError("Smart Solution not found", 404);
      }
      if (existingSmartSolution.image) {
        await deleteFile(existingSmartSolution.image);
      }
      await prisma.smartSolution.delete({ where: { id } });
      res
        .status(200)
        .json(response(200, true, "Smart Solution deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }
}

export default SmartSolutionController;
