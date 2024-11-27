import Joi from "joi";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const templateSchema = Joi.object({
  nameEn: Joi.string().required(),
  nameAr: Joi.string().required(),
  slug: Joi.string().required(),
  isActive: Joi.boolean().default(true),
  seoDescriptionEn: Joi.string().allow("", null),
  seoDescriptionAr: Joi.string().allow("", null),
  description1En: Joi.string().allow("", null),
  description1Ar: Joi.string().allow("", null),
  description2En: Joi.string().allow("", null),
  description2Ar: Joi.string().allow("", null),
  description3En: Joi.string().allow("", null),
  description3Ar: Joi.string().allow("", null),
  pageId: Joi.string().required(),
});

const templateUpdateSchema = Joi.object({
  nameEn: Joi.string(),
  nameAr: Joi.string(),
  slug: Joi.string(),
  isActive: Joi.boolean(),
  seoDescriptionEn: Joi.string().allow("", null),
  seoDescriptionAr: Joi.string().allow("", null),
  description1En: Joi.string().allow("", null),
  description1Ar: Joi.string().allow("", null),
  description2En: Joi.string().allow("", null),
  description2Ar: Joi.string().allow("", null),
  description3En: Joi.string().allow("", null),
  description3Ar: Joi.string().allow("", null),
  pageId: Joi.string(),
}).min(1);

// Add a separate schema for templateType validation
const templateTypeSchema = Joi.object({
  templateType: Joi.string()
    .required()
    .valid(
      "template1",
      "template2",
      "template3",
      "template4",
      "template5",
      "template6",
      "template7"
    ),
});

class TemplateController {
  static async createTemplate(req, res, next) {
    let imagePaths = [];
    try {
      // Validate templateType from query
      const { error: typeError } = templateTypeSchema.validate({
        templateType: req.query.templateType,
      });
      if (typeError) {
        throw new MyError(typeError.details[0].message, 400);
      }

      const { error, value } = templateSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      // Check if page exists
      const page = await prisma.page.findUnique({
        where: { id: value.pageId },
      });

      if (!page) {
        throw new MyError("Page not found", 404);
      }

      // Check if slug already exists in the specified template
      const existingTemplate = await prisma[req.query.templateType].findFirst({
        where: { slug: value.slug },
      });

      if (existingTemplate) {
        throw new MyError(
          `Slug already exists in ${req.query.templateType}`,
          400
        );
      }

      // Handle image uploads
      if (req.files) {
        for (let i = 1; i <= 3; i++) {
          if (req.files[`image${i}`]) {
            const imagePath = addDomain(req.files[`image${i}`][0].path);
            value[`image${i}`] = imagePath;
            imagePaths.push(imagePath);
          }
        }
      }

      const template = await prisma[req.query.templateType].create({
        data: value,
      });

      res
        .status(201)
        .json(
          response(201, true, "Template created successfully", { template })
        );
    } catch (error) {
      // Clean up uploaded images if there was an error
      for (const path of imagePaths) {
        await deleteFile(path);
      }
      next(error);
    }
  }

  static async getTemplateBySlug(req, res, next) {
    try {
      const { templateType, slug } = req.params;

      if (!prisma[templateType]) {
        throw new MyError("Invalid template type", 400);
      }

      const template = await prisma[templateType].findFirst({
        where: { slug },
        include: {
          page: true,
        },
      });

      if (!template) {
        throw new MyError("Template not found", 404);
      }

      res
        .status(200)
        .json(
          response(200, true, "Template retrieved successfully", { template })
        );
    } catch (error) {
      next(error);
    }
  }

  static async updateTemplate(req, res, next) {
    let imagePaths = [];
    try {
      // Validate templateType from query
      const { error: typeError } = templateTypeSchema.validate({
        templateType: req.query.templateType,
      });
      if (typeError) {
        throw new MyError(typeError.details[0].message, 400);
      }

      const { id } = req.params;
      const { error, value } = templateUpdateSchema.validate(req.body);

      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      if (!prisma[req.query.templateType]) {
        throw new MyError("Invalid template type", 400);
      }

      // Check if template exists
      const existingTemplate = await prisma[req.query.templateType].findUnique({
        where: { id },
      });

      if (!existingTemplate) {
        throw new MyError("Template not found", 404);
      }

      // Check if new slug conflicts with existing ones
      if (value.slug && value.slug !== existingTemplate.slug) {
        const slugExists = await prisma[req.query.templateType].findFirst({
          where: {
            slug: value.slug,
            NOT: { id },
          },
        });

        if (slugExists) {
          throw new MyError(
            `Slug already exists in ${req.query.templateType}`,
            400
          );
        }
      }

      // Handle image uploads
      if (req.files) {
        for (let i = 1; i <= 3; i++) {
          if (req.files[`image${i}`]) {
            const imagePath = addDomain(req.files[`image${i}`][0].path);
            if (existingTemplate[`image${i}`]) {
              await deleteFile(existingTemplate[`image${i}`]);
            }
            value[`image${i}`] = imagePath;
            imagePaths.push(imagePath);
          }
        }
      }

      const template = await prisma[req.query.templateType].update({
        where: { id },
        data: value,
        include: {
          page: true,
        },
      });

      res
        .status(200)
        .json(
          response(200, true, "Template updated successfully", { template })
        );
    } catch (error) {
      // Clean up uploaded images if there was an error
      for (const path of imagePaths) {
        await deleteFile(path);
      }
      next(error);
    }
  }

  static async deleteTemplate(req, res, next) {
    try {
      const { templateType, id } = req.params;

      if (!prisma[templateType]) {
        throw new MyError("Invalid template type", 400);
      }

      const template = await prisma[templateType].findUnique({
        where: { id },
      });

      if (!template) {
        throw new MyError("Template not found", 404);
      }

      // Delete associated images
      for (let i = 1; i <= 3; i++) {
        if (template[`image${i}`]) {
          await deleteFile(template[`image${i}`]);
        }
      }

      await prisma[templateType].delete({
        where: { id },
      });

      res
        .status(200)
        .json(response(200, true, "Template deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default TemplateController;
