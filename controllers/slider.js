import Joi from "joi";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const sliderSchema = Joi.object({
  titleEn: Joi.string().allow("", null),
  titleAr: Joi.string().allow("", null),
  descriptionEn: Joi.string().allow("", null),
  descriptionAr: Joi.string().allow("", null),
  captionEn: Joi.string().allow("", null),
  captionAr: Joi.string().allow("", null),
  imageEn: Joi.string().allow("", null),
  imageAr: Joi.string().allow("", null),
  pageId: Joi.string().allow(null, ""),
  status: Joi.number().valid(0, 1).default(1),
});

class SliderController {
  static async createSlider(req, res, next) {
    let imagePaths = [];
    try {
      const { error, value } = sliderSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      if (req.files) {
        if (req.files.imageEn) {
          const imageEnPath = addDomain(req.files.imageEn[0].path);
          value.imageEn = imageEnPath;
          imagePaths.push(imageEnPath);
        }
        if (req.files.imageAr) {
          const imageArPath = addDomain(req.files.imageAr[0].path);
          value.imageAr = imageArPath;
          imagePaths.push(imageArPath);
        }
      }

      const slider = await prisma.slider.create({
        data: value,
      });

      res
        .status(201)
        .json(response(201, true, "Slider created successfully", { slider }));
    } catch (error) {
      // Clean up uploaded files if there was an error
      for (const path of imagePaths) {
        await deleteFile(path);
      }
      next(error);
    }
  }

  static async getSliders(req, res, next) {
    try {
      const sliders = await prisma.slider.findMany({
        include: {
          page: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      res
        .status(200)
        .json(
          response(200, true, "Sliders retrieved successfully", { sliders })
        );
    } catch (error) {
      next(error);
    }
  }

  static async getActiveSliders(req, res, next) {
    try {
      const sliders = await prisma.slider.findMany({
        where: {
          status: 1,
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          page: true,
        },
      });

      res.status(200).json(
        response(200, true, "Active sliders retrieved successfully", {
          sliders,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getSlider(req, res, next) {
    try {
      const { id } = req.params;

      const slider = await prisma.slider.findUnique({
        where: { id },
        include: {
          page: true,
        },
      });

      if (!slider) {
        throw new MyError("Slider not found", 404);
      }

      res
        .status(200)
        .json(response(200, true, "Slider retrieved successfully", { slider }));
    } catch (error) {
      next(error);
    }
  }

  static async updateSlider(req, res, next) {
    let imagePaths = [];
    try {
      const { id } = req.params;
      const { error, value } = sliderSchema.validate(req.body);

      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const existingSlider = await prisma.slider.findUnique({
        where: { id },
      });

      if (!existingSlider) {
        throw new MyError("Slider not found", 404);
      }

      if (req.files) {
        if (req.files.imageEn) {
          const imageEnPath = addDomain(req.files.imageEn[0].path);
          if (existingSlider.imageEn) {
            await deleteFile(existingSlider.imageEn);
          }
          value.imageEn = imageEnPath;
          imagePaths.push(imageEnPath);
        }
        if (req.files.imageAr) {
          const imageArPath = addDomain(req.files.imageAr[0].path);
          if (existingSlider.imageAr) {
            await deleteFile(existingSlider.imageAr);
          }
          value.imageAr = imageArPath;
          imagePaths.push(imageArPath);
        }
      }

      const slider = await prisma.slider.update({
        where: { id },
        data: value,
      });

      res
        .status(200)
        .json(response(200, true, "Slider updated successfully", { slider }));
    } catch (error) {
      // Clean up uploaded files if there was an error
      for (const path of imagePaths) {
        await deleteFile(path);
      }
      next(error);
    }
  }

  static async deleteSlider(req, res, next) {
    try {
      const { id } = req.params;

      const existingSlider = await prisma.slider.findUnique({
        where: { id },
      });

      if (!existingSlider) {
        throw new MyError("Slider not found", 404);
      }

      if (existingSlider.imageEn) {
        await deleteFile(existingSlider.imageEn);
      }
      if (existingSlider.imageAr) {
        await deleteFile(existingSlider.imageAr);
      }

      await prisma.slider.delete({
        where: { id },
      });

      res
        .status(200)
        .json(response(200, true, "Slider deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }
}

export default SliderController;
