import Joi from "joi";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const coreSolutionSchema = Joi.object({
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
});

class CoreSolutionController {
  static async createCoreSolution(req, res, next) {
    let imagePath;
    try {
      const { error, value } = coreSolutionSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      if (req.file) {
        imagePath = addDomain(req.file.path);
        value.image = imagePath;
      }

      const coreSolution = await prisma.coreSolution.create({
        data: value,
      });

      res.status(201).json(
        response(201, true, "Core Solution created successfully", {
          coreSolution,
        })
      );
    } catch (error) {
      if (imagePath) {
        await deleteFile(imagePath);
      }
      next(error);
    }
  }

  static async getCoreSolutions(req, res, next) {
    try {
      const coreSolutions = await prisma.coreSolution.findMany({
        include: {
          page: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      res.status(200).json(
        response(200, true, "Core Solutions retrieved successfully", {
          coreSolutions,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getCoreSolution(req, res, next) {
    try {
      const { id } = req.params;

      const coreSolution = await prisma.coreSolution.findUnique({
        where: { id },
      });

      if (!coreSolution) {
        throw new MyError("Core Solution not found", 404);
      }

      res.status(200).json(
        response(200, true, "Core Solution retrieved successfully", {
          coreSolution,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateCoreSolution(req, res, next) {
    let imagePath;
    try {
      const { id } = req.params;
      const { error, value } = coreSolutionSchema.validate(req.body);

      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const existingCoreSolution = await prisma.coreSolution.findUnique({
        where: { id },
      });

      if (!existingCoreSolution) {
        throw new MyError("Core Solution not found", 404);
      }

      if (req.file) {
        imagePath = addDomain(req.file.path);
        if (existingCoreSolution.image) {
          await deleteFile(existingCoreSolution.image);
        }
        value.image = imagePath;
      }

      const coreSolution = await prisma.coreSolution.update({
        where: { id },
        data: value,
      });

      res.status(200).json(
        response(200, true, "Core Solution updated successfully", {
          coreSolution,
        })
      );
    } catch (error) {
      if (imagePath) {
        await deleteFile(imagePath);
      }
      next(error);
    }
  }

  static async getActiveCoreSolutions(req, res, next) {
    try {
      const coreSolutions = await prisma.coreSolution.findMany({
        where: { isActive: true },
        orderBy: {
          createdAt: "asc",
        },
      });

      res.status(200).json(
        response(200, true, "Active Core Solutions retrieved successfully", {
          coreSolutions,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteCoreSolution(req, res, next) {
    try {
      const { id } = req.params;

      const existingCoreSolution = await prisma.coreSolution.findUnique({
        where: { id },
      });

      if (!existingCoreSolution) {
        throw new MyError("Core Solution not found", 404);
      }

      if (existingCoreSolution.image) {
        await deleteFile(existingCoreSolution.image);
      }

      await prisma.coreSolution.delete({
        where: { id },
      });

      res
        .status(200)
        .json(response(200, true, "Core Solution deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }
}

export default CoreSolutionController;
