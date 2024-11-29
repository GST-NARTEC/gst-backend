import Joi from "joi";
import MyError from "../utils/error.js";

// Base schemas with common fields
const baseTemplateSchema = {
  nameEn: Joi.string().required(),
  nameAr: Joi.string().required(),
  isActive: Joi.boolean().default(true),
  pageId: Joi.string().required(),
};

const baseUpdateSchema = {
  nameEn: Joi.string(),
  nameAr: Joi.string(),
  isActive: Joi.boolean(),
  pageId: Joi.string(),
};

// Common optional fields
const commonOptionalFields = {
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
};

// Button fields
const buttonFields = {
  buttonText1En: Joi.string().allow("", null),
  buttonText1Ar: Joi.string().allow("", null),
  buttonText2En: Joi.string().allow("", null),
  buttonText2Ar: Joi.string().allow("", null),
  buttonNavigation1En: Joi.string().allow("", null),
  buttonNavigation1Ar: Joi.string().allow("", null),
  buttonNavigation2En: Joi.string().allow("", null),
  buttonNavigation2Ar: Joi.string().allow("", null),
};

// Heading fields
const headingFields = {
  headingEn: Joi.string().allow("", null),
  headingAr: Joi.string().allow("", null),
};

// Template specific schemas
const templateSchemas = {
  template1: Joi.object({
    ...baseTemplateSchema,
    ...commonOptionalFields,
  }).unknown(false),

  template2: Joi.object({
    ...baseTemplateSchema,
    ...commonOptionalFields,
    ...headingFields,
  }).unknown(false),

  template3: Joi.object({
    ...baseTemplateSchema,
    ...commonOptionalFields,
    ...headingFields,
    ...buttonFields,
  }).unknown(false),

  template4: Joi.object({
    ...baseTemplateSchema,
    ...commonOptionalFields,
    ...buttonFields,
    description4En: Joi.string().allow("", null),
    description4Ar: Joi.string().allow("", null),
  }).unknown(false),
};

// Update schemas
const templateUpdateSchemas = {
  template1: Joi.object({
    ...baseUpdateSchema,
    ...commonOptionalFields,
  })
    .min(1)
    .unknown(false),

  template2: Joi.object({
    ...baseUpdateSchema,
    ...commonOptionalFields,
    ...headingFields,
  })
    .min(1)
    .unknown(false),

  template3: Joi.object({
    ...baseUpdateSchema,
    ...commonOptionalFields,
    ...headingFields,
    ...buttonFields,
  })
    .min(1)
    .unknown(false),

  template4: Joi.object({
    ...baseUpdateSchema,
    ...commonOptionalFields,
    ...buttonFields,
    description4En: Joi.string().allow("", null),
    description4Ar: Joi.string().allow("", null),
  })
    .min(1)
    .unknown(false),
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

const getSchemaForType = (templateType) => {
  const schema = templateSchemas[templateType];
  if (!schema) {
    throw new MyError(`Invalid template type: ${templateType}`, 400);
  }
  return schema;
};

const getUpdateSchemaForType = (templateType) => {
  const schema = templateUpdateSchemas[templateType];
  if (!schema) {
    throw new MyError(`Invalid template type: ${templateType}`, 400);
  }
  return schema;
};

export {
  getSchemaForType,
  getUpdateSchemaForType,
  templateSchemas,
  templateTypeSchema,
  templateUpdateSchemas,
};
