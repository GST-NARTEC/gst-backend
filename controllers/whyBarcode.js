import Joi from "joi";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const whyBarcodeSchema = Joi.object({
  titleEn: Joi.string().allow("", null),
  titleAr: Joi.string().allow("", null),
  descriptionEn: Joi.string().allow("", null),
  descriptionAr: Joi.string().allow("", null),
  image: Joi.string().allow("", null),
  captionEn: Joi.string().allow("", null),
  captionAr: Joi.string().allow("", null),
  isActive: Joi.boolean().default(true),
});

class WhyBarcodeController {
  static async createWhyBarcode(req, res, next) {
    let imagePath;
    try {
      const { error, value } = whyBarcodeSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      if (req.file) {
        imagePath = addDomain(req.file.path);
        value.image = imagePath;
      }

      const whyBarcode = await prisma.whyBarcode.create({
        data: value,
      });

      res.status(201).json(
        response(201, true, "Why Barcode created successfully", {
          whyBarcode,
        })
      );
    } catch (error) {
      if (imagePath) {
        await deleteFile(imagePath);
      }
      next(error);
    }
  }

  static async getWhyBarcodes(req, res, next) {
    try {
      const whyBarcodes = await prisma.whyBarcode.findMany({
        orderBy: {
          createdAt: "asc",
        },
      });

      res.status(200).json(
        response(200, true, "Why Barcodes retrieved successfully", {
          whyBarcodes,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getWhyBarcode(req, res, next) {
    try {
      const { id } = req.params;

      const whyBarcode = await prisma.whyBarcode.findUnique({
        where: { id },
      });

      if (!whyBarcode) {
        throw new MyError("Why Barcode not found", 404);
      }

      res.status(200).json(
        response(200, true, "Why Barcode retrieved successfully", {
          whyBarcode,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getActiveWhyBarcodes(req, res, next) {
    try {
      const whyBarcodes = await prisma.whyBarcode.findMany({
        where: { 
          isActive: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (!whyBarcodes || whyBarcodes.length === 0) {
        return res.status(200).json(
          response(200, true, "No active why barcodes found", {
            whyBarcodes: [],
          })
        );
      }

      res.status(200).json(
        response(200, true, "Active Why Barcodes retrieved successfully", {
          whyBarcodes,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateWhyBarcode(req, res, next) {
    let imagePath;
    try {
      const { id } = req.params;
      const { error, value } = whyBarcodeSchema.validate(req.body);

      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const existingWhyBarcode = await prisma.whyBarcode.findUnique({
        where: { id },
      });

      if (!existingWhyBarcode) {
        throw new MyError("Why Barcode not found", 404);
      }

      if (req.file) {
        imagePath = addDomain(req.file.path);
        if (existingWhyBarcode.image) {
          await deleteFile(existingWhyBarcode.image);
        }
        value.image = imagePath;
      }

      const whyBarcode = await prisma.whyBarcode.update({
        where: { id },
        data: value,
      });

      res.status(200).json(
        response(200, true, "Why Barcode updated successfully", {
          whyBarcode,
        })
      );
    } catch (error) {
      if (imagePath) {
        await deleteFile(imagePath);
      }
      next(error);
    }
  }

  static async deleteWhyBarcode(req, res, next) {
    try {
      const { id } = req.params;

      const existingWhyBarcode = await prisma.whyBarcode.findUnique({
        where: { id },
      });

      if (!existingWhyBarcode) {
        throw new MyError("Why Barcode not found", 404);
      }

      if (existingWhyBarcode.image) {
        await deleteFile(existingWhyBarcode.image);
      }

      await prisma.whyBarcode.delete({
        where: { id },
      });

      res
        .status(200)
        .json(response(200, true, "Why Barcode deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }
}

export default WhyBarcodeController;
