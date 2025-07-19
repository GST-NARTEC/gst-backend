import Joi from "joi";
import MyError from "../utils/error.js";

// Base schemas with common fields
const baseTemplateSchema = {
  nameEn: Joi.string().allow(null),
  nameAr: Joi.string().allow(null),
  isActive: Joi.boolean().default(true),
  pageId: Joi.string().allow(null),
};

const baseUpdateSchema = {
  nameEn: Joi.string().allow(null),
  nameAr: Joi.string().allow(null),
  isActive: Joi.boolean(),
  pageId: Joi.string().allow(null),
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
  description4En: Joi.string().allow("", null),
  description4Ar: Joi.string().allow("", null),
  image1: Joi.string().allow("", null),
  image2: Joi.string().allow("", null),
  image3: Joi.string().allow("", null),
};

// Button fields for template 2
const buttonFieldsTemplate2 = {
  buttonTextEn: Joi.string().allow("", null),
  buttonTextAr: Joi.string().allow("", null),
  buttonNavigationEn: Joi.string().allow("", null),
  buttonNavigationAr: Joi.string().allow("", null),
};

// Button fields for template 3, 4 & sunrize2027Template
const buttonFieldsExtended = {
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

// Case study specific fields
const caseStudyFields = {
  resultImpactEn: Joi.string().allow("", null),
  resultImpactAr: Joi.string().allow("", null),
  technologiesUsedEn: Joi.string().allow("", null),
  technologiesUsedAr: Joi.string().allow("", null),
};

// Add specific fields for new templates
const caseStudyMainFields = {
  headerEn: Joi.string().allow("", null),
  headerAr: Joi.string().allow("", null),
  footerEn: Joi.string().allow("", null),
  footerAr: Joi.string().allow("", null),
};

const halalTemplateFields = {
  headerEn: Joi.string().allow("", null),
  headerAr: Joi.string().allow("", null),
  descriptionEn: Joi.string().allow("", null),
  descriptionAr: Joi.string().allow("", null),
  image1: Joi.string().allow("", null),
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
    ...buttonFieldsTemplate2,
  }).unknown(false),

  template3: Joi.object({
    ...baseTemplateSchema,
    ...commonOptionalFields,
    ...headingFields,
    ...buttonFieldsExtended,
  }).unknown(false),

  template4: Joi.object({
    ...baseTemplateSchema,
    ...commonOptionalFields,
    ...buttonFieldsExtended,
    // description4En: Joi.string().allow("", null),
    // description4Ar: Joi.string().allow("", null),
  }).unknown(false),

  sunrize2027Template: Joi.object({
    ...baseTemplateSchema,
    ...commonOptionalFields,
    ...headingFields,
    ...buttonFieldsExtended,
  }).unknown(false),

  caseStudyTemplate1: Joi.object({
    ...baseTemplateSchema,
    ...commonOptionalFields,
    ...headingFields,
    ...caseStudyFields,
  }).unknown(false),

  caseStudyTemplate2: Joi.object({
    ...baseTemplateSchema,
    ...commonOptionalFields,
    ...headingFields,
    ...caseStudyFields,
  }).unknown(false),

  caseStudyMainTemplate: Joi.object({
    ...baseTemplateSchema,
    ...caseStudyMainFields,
  }).unknown(false),

  halalTemplate: Joi.object({
    ...baseTemplateSchema,
    ...halalTemplateFields,
  }).unknown(false),
};

// Update schemas
const templateUpdateSchemas = {
  template1: Joi.object({
    ...baseUpdateSchema,
    ...commonOptionalFields,
  }).unknown(false),

  template2: Joi.object({
    ...baseUpdateSchema,
    ...commonOptionalFields,
    ...headingFields,
    ...buttonFieldsTemplate2,
  }).unknown(false),

  template3: Joi.object({
    ...baseUpdateSchema,
    ...commonOptionalFields,
    ...headingFields,
    ...buttonFieldsExtended,
  }).unknown(false),

  template4: Joi.object({
    ...baseUpdateSchema,
    ...commonOptionalFields,
    ...buttonFieldsExtended,
    // description4En: Joi.string().allow("", null),
    // description4Ar: Joi.string().allow("", null),
  }).unknown(false),

  sunrize2027Template: Joi.object({
    ...baseUpdateSchema,
    ...commonOptionalFields,
    ...headingFields,
    ...buttonFieldsExtended,
  }).unknown(false),

  caseStudyTemplate1: Joi.object({
    ...baseUpdateSchema,
    ...commonOptionalFields,
    ...headingFields,
    ...caseStudyFields,
  }).unknown(false),

  caseStudyTemplate2: Joi.object({
    ...baseUpdateSchema,
    ...commonOptionalFields,
    ...headingFields,
    ...caseStudyFields,
  }).unknown(false),

  caseStudyMainTemplate: Joi.object({
    ...baseUpdateSchema,
    ...caseStudyMainFields,
  }).unknown(false),

  halalTemplate: Joi.object({
    ...baseUpdateSchema,
    ...halalTemplateFields,
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
      "sunrize2027Template",
      "caseStudyTemplate1",
      "caseStudyTemplate2",
      "caseStudyMainTemplate",
      "halalTemplate"
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
