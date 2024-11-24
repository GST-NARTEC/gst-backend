import Joi from "joi";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const proServiceSchema = Joi.object({
  titleEn: Joi.string().required(),
  titleAr: Joi.string().required(),
  descriptionEn: Joi.string().required(),
  descriptionAr: Joi.string().required(),
  image: Joi.string().allow("", null),
  status: Joi.number().valid(0, 1).default(1),
});

class ProServiceController {
  static async createProService(req, res, next) {
    let imagePath;
    try {
      const { error, value } = proServiceSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      if (req.file) {
        imagePath = addDomain(req.file.path);
        value.image = imagePath;
      }

      const proService = await prisma.proService.create({
        data: value,
      });

      res.status(201).json(
        response(201, true, "Pro Service created successfully", {
          proService,
        })
      );
    } catch (error) {
      if (imagePath) {
        await deleteFile(imagePath);
      }
      next(error);
    }
  }

  static async getProServices(req, res, next) {
    try {
      const proServices = await prisma.proService.findMany({
        orderBy: {
          createdAt: "asc",
        },
      });

      res.status(200).json(
        response(200, true, "Pro Services retrieved successfully", {
          proServices,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getActiveProServices(req, res, next) {
    try {
      const proServices = await prisma.proService.findMany({
        where: {
          status: 1,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      res.status(200).json(
        response(200, true, "Active Pro Services retrieved successfully", {
          proServices,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getProService(req, res, next) {
    try {
      const { id } = req.params;

      const proService = await prisma.proService.findUnique({
        where: { id },
      });

      if (!proService) {
        throw new MyError("Pro Service not found", 404);
      }

      res.status(200).json(
        response(200, true, "Pro Service retrieved successfully", {
          proService,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateProService(req, res, next) {
    let imagePath;
    try {
      const { id } = req.params;
      const { error, value } = proServiceSchema.validate(req.body);

      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const existingProService = await prisma.proService.findUnique({
        where: { id },
      });

      if (!existingProService) {
        throw new MyError("Pro Service not found", 404);
      }

      if (req.file) {
        imagePath = addDomain(req.file.path);
        if (existingProService.image) {
          await deleteFile(existingProService.image);
        }
        value.image = imagePath;
      }

      const proService = await prisma.proService.update({
        where: { id },
        data: value,
      });

      res.status(200).json(
        response(200, true, "Pro Service updated successfully", {
          proService,
        })
      );
    } catch (error) {
      if (imagePath) {
        await deleteFile(imagePath);
      }
      next(error);
    }
  }

  static async deleteProService(req, res, next) {
    try {
      const { id } = req.params;

      const existingProService = await prisma.proService.findUnique({
        where: { id },
      });

      if (!existingProService) {
        throw new MyError("Pro Service not found", 404);
      }

      if (existingProService.image) {
        await deleteFile(existingProService.image);
      }

      await prisma.proService.delete({
        where: { id },
      });

      res
        .status(200)
        .json(response(200, true, "Pro Service deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }
}

export default ProServiceController;
