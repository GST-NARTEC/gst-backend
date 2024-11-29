import Joi from "joi";

import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

// Base template schema with common fields
const baseTemplateSchema = {
  nameEn: Joi.string().required(),
  nameAr: Joi.string().required(),
  isActive: Joi.boolean().default(true),
  pageId: Joi.string().required(),
};

// Template specific schemas
const templateSchemas = {
  template1: Joi.object({
    ...baseTemplateSchema,
    seoDescriptionEn: Joi.string().allow("", null),
    seoDescriptionAr: Joi.string().allow("", null),
    description1En: Joi.string().allow("", null),
    description1Ar: Joi.string().allow("", null),
    description2En: Joi.string().allow("", null),
    description2Ar: Joi.string().allow("", null),
    description3En: Joi.string().allow("", null),
    description3Ar: Joi.string().allow("", null),
    image1: Joi.string().allow("", null),
    image2: Joi.string().allow("", null),
    image3: Joi.string().allow("", null),
  }).unknown(false),
  template2: Joi.object({
    ...baseTemplateSchema,
    seoDescriptionEn: Joi.string().allow("", null),
    seoDescriptionAr: Joi.string().allow("", null),
    headingEn: Joi.string().allow("", null),
    headingAr: Joi.string().allow("", null),
    description1En: Joi.string().allow("", null),
    description1Ar: Joi.string().allow("", null),
    description2En: Joi.string().allow("", null),
    description2Ar: Joi.string().allow("", null),
    description3En: Joi.string().allow("", null),
    description3Ar: Joi.string().allow("", null),
    image1: Joi.string().allow("", null),
    image2: Joi.string().allow("", null),
    image3: Joi.string().allow("", null),
  }).unknown(false),
};

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

// Move getSchemaForType outside the class as a standalone function
const getSchemaForType = (templateType) => {
  const schema = templateSchemas[templateType];
  if (!schema) {
    throw new MyError(`Invalid template type: ${templateType}`, 400);
  }
  return schema;
};

class TemplateController {
  static async createTemplate(req, res, next) {
    let imagePaths = [];
    try {
      const { templateType } = req.params;

      // Validate templateType
      const { error: typeError } = templateTypeSchema.validate({
        templateType,
      });
      if (typeError) {
        throw new MyError(typeError.details[0].message, 400);
      }

      // Use the standalone function instead of this.getSchemaForType
      const schema = getSchemaForType(templateType);
      const { error, value } = schema.validate(req.body);

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
      const existingTemplate = await prisma[templateType].findFirst({
        where: { pageId: value.pageId },
      });

      if (existingTemplate) {
        throw new MyError(`Slug already exists in ${templateType}`, 400);
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

      const template = await prisma[templateType].create({
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

  static async getTemplateByPageId(req, res, next) {
    try {
      const { templateType } = req.params;
      const { pageId } = req.query;

      if (!prisma[templateType]) {
        throw new MyError("Invalid template type", 400);
      }

      const template = await prisma[templateType].findFirst({
        where: { pageId },
        // include: {
        //   page: true,
        // },
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
      const { templateType, id } = req.params;

      // Validate templateType
      const { error: typeError } = templateTypeSchema.validate({
        templateType,
      });
      if (typeError) {
        throw new MyError(typeError.details[0].message, 400);
      }

      // Use the standalone function instead of this.getSchemaForType
      const schema = getSchemaForType(templateType);
      const { error, value } = schema.validate(req.body);

      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      if (!prisma[templateType]) {
        throw new MyError("Invalid template type", 400);
      }

      // Check if template exists
      const existingTemplate = await prisma[templateType].findUnique({
        where: { id },
      });

      if (!existingTemplate) {
        throw new MyError("Template not found", 404);
      }

      // Check if new slug conflicts with existing ones
      if (value.slug && value.slug !== existingTemplate.slug) {
        const slugExists = await prisma[templateType].findFirst({
          where: {
            slug: value.slug,
            NOT: { id },
          },
        });

        if (slugExists) {
          throw new MyError(`Slug already exists in ${templateType}`, 400);
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

      const template = await prisma[templateType].update({
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

  static async getTemplatesByType(req, res, next) {
    try {
      const { templateType } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // Validate templateType
      const { error: typeError } = templateTypeSchema.validate({
        templateType,
      });
      if (typeError) {
        throw new MyError(typeError.details[0].message, 400);
      }

      if (!prisma[templateType]) {
        throw new MyError("Invalid template type", 400);
      }

      const skip = (page - 1) * limit;

      const [templates, total] = await Promise.all([
        prisma[templateType].findMany({
          take: Number(limit),
          skip: Number(skip),
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
            isActive: true,
            page: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma[templateType].count(),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        response(200, true, "Templates retrieved successfully", {
          templates,
          pagination: {
            total,
            page: Number(page),
            totalPages,
            limit: Number(limit),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default TemplateController;
