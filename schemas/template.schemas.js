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

// Button fields for template 3
const buttonFieldsTemplate3 = {
  buttonText1En: Joi.string().allow("", null),
  buttonText1Ar: Joi.string().allow("", null),
  buttonText2En: Joi.string().allow("", null),
  buttonText2Ar: Joi.string().allow("", null),
  buttonNavigation1En: Joi.string().allow("", null),
  buttonNavigation1Ar: Joi.string().allow("", null),
  buttonNavigation2En: Joi.string().allow("", null),
  buttonNavigation2Ar: Joi.string().allow("", null),
};

// Button fields for template 4
const buttonFieldsTemplate4 = {
  buttonText1En: Joi.string().allow("", null),
  buttonText1Ar: Joi.string().allow("", null),
  buttonText2En: Joi.string().allow("", null),
  buttonText2Ar: Joi.string().allow("", null),
  buttonNavigation1En: Joi.string().allow("", null),
  buttonNavigation1Ar: Joi.string().allow("", null),
  buttonNavigation2En: Joi.string().allow("", null),
  buttonNavigation2Ar: Joi.string().allow("", null),
};

// Button fields for sunrize2027Template
const buttonFieldsExtended = {
  buttonText1En: Joi.string().allow("", null),
  buttonText1Ar: Joi.string().allow("", null),
  buttonText2En: Joi.string().allow("", null),
  buttonText2Ar: Joi.string().allow("", null),
  buttonLink1: Joi.string().allow("", null),
  buttonLink2: Joi.string().allow("", null),
};

// Heading fields
const headingFields = {
  headingEn: Joi.string().allow("", null),
  headingAr: Joi.string().allow("", null),
};

// Sunrize2027Template specific fields
const sunrize2027TemplateFields = {
  industriesTitleEn: Joi.string().allow("", null),
  industriesTitleAr: Joi.string().allow("", null),
  retailContentEn: Joi.string().allow("", null),
  retailContentAr: Joi.string().allow("", null),
  logisticsContentEn: Joi.string().allow("", null),
  logisticsContentAr: Joi.string().allow("", null),
  manufacturingContentEn: Joi.string().allow("", null),
  manufacturingContentAr: Joi.string().allow("", null),
  healthcareContentEn: Joi.string().allow("", null),
  healthcareContentAr: Joi.string().allow("", null),
  description5En: Joi.string().allow("", null),
  description5Ar: Joi.string().allow("", null),
  image4: Joi.string().allow("", null),
  image5: Joi.string().allow("", null),
  image6: Joi.string().allow("", null),
  image7: Joi.string().allow("", null),
};

// Case study specific fields for template 2
const caseStudyTemplate2Fields = {
  nameEn: Joi.string().allow("", null),
  nameAr: Joi.string().allow("", null),
  pageId: Joi.string().allow(null),
  isActive: Joi.boolean().default(true),
  seoDescriptionEn: Joi.string().allow("", null),
  seoDescriptionAr: Joi.string().allow("", null),

  // Hero Section
  headingEn: Joi.string().allow("", null),
  headingAr: Joi.string().allow("", null),
  image1: Joi.string().allow("", null),

  // About The Client Section (description1)
  description1En: Joi.string().allow("", null),
  description1Ar: Joi.string().allow("", null),
  image2: Joi.string().allow("", null),

  // The Challenges Section (description2)
  description2En: Joi.string().allow("", null),
  description2Ar: Joi.string().allow("", null),
  image3: Joi.string().allow("", null),

  // The Solution Section (description3)
  description3En: Joi.string().allow("", null),
  description3Ar: Joi.string().allow("", null),

  // Workflow Highlights Section (description4)
  description4En: Joi.string().allow("", null),
  description4Ar: Joi.string().allow("", null),

  // Results & Key Benefits Section (description5)
  description5En: Joi.string().allow("", null),
  description5Ar: Joi.string().allow("", null),

  // Key Learnings Section (description6)
  description6En: Joi.string().allow("", null),
  description6Ar: Joi.string().allow("", null),

  // The Technology Section (description7)
  description7En: Joi.string().allow("", null),
  description7Ar: Joi.string().allow("", null),

  // Partner Highlights Section (description8)
  description8En: Joi.string().allow("", null),
  description8Ar: Joi.string().allow("", null),
};

// Add specific fields for new templates
const caseStudyMainFields = {
  headerEn: Joi.string().allow("", null),
  headerAr: Joi.string().allow("", null),
  footerEn: Joi.string().allow("", null),
  footerAr: Joi.string().allow("", null),
  pageId: Joi.string().allow(null),
};

const halalTemplateFields = {
  headerEn: Joi.string().allow("", null),
  headerAr: Joi.string().allow("", null),
  descriptionEn: Joi.string().allow("", null),
  descriptionAr: Joi.string().allow("", null),
  image1: Joi.string().allow("", null),
  pageId: Joi.string().allow(null),
};

// CaseStudyTemplate1 specific fields
const caseStudyTemplate1Fields = {
  nameEn: Joi.string().allow("", null),
  nameAr: Joi.string().allow("", null),
  pageId: Joi.string().allow(null),
  isActive: Joi.boolean().default(true),
  seoDescriptionEn: Joi.string().allow("", null),
  seoDescriptionAr: Joi.string().allow("", null),

  // Hero Section
  headingEn: Joi.string().allow("", null),
  headingAr: Joi.string().allow("", null),
  image1: Joi.string().allow("", null),

  // Overview Section
  description1En: Joi.string().allow("", null),
  description1Ar: Joi.string().allow("", null),
  descriptionQuote1En: Joi.string().allow("", null),
  descriptionQuote1Ar: Joi.string().allow("", null),
  descriptionAuthor1En: Joi.string().allow("", null),
  descriptionAuthor1Ar: Joi.string().allow("", null),

  // Solution Section
  description2En: Joi.string().allow("", null),
  description2Ar: Joi.string().allow("", null),
  description3En: Joi.string().allow("", null),
  description3Ar: Joi.string().allow("", null),
  image2: Joi.string().allow("", null),
  description4En: Joi.string().allow("", null),
  description4Ar: Joi.string().allow("", null),
  description5En: Joi.string().allow("", null),
  description5Ar: Joi.string().allow("", null),

  // Results Section
  description6En: Joi.string().allow("", null),
  description6Ar: Joi.string().allow("", null),
  image3: Joi.string().allow("", null),
  description7En: Joi.string().allow("", null),
  description7Ar: Joi.string().allow("", null),
  descriptionQuote2En: Joi.string().allow("", null),
  descriptionQuote2Ar: Joi.string().allow("", null),
  descriptionAuthor2En: Joi.string().allow("", null),
  descriptionAuthor2Ar: Joi.string().allow("", null),

  // Final Section
  image4: Joi.string().allow("", null),
  description8En: Joi.string().allow("", null),
  description8Ar: Joi.string().allow("", null),
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
    ...buttonFieldsTemplate3,
  }).unknown(false),

  template4: Joi.object({
    ...baseTemplateSchema,
    ...commonOptionalFields,
    ...buttonFieldsTemplate4,
  }).unknown(false),

  sunrize2027Template: Joi.object({
    ...baseTemplateSchema,
    ...commonOptionalFields,
    ...headingFields,
    ...buttonFieldsExtended,
    ...sunrize2027TemplateFields,
  }).unknown(false),

  caseStudyTemplate1: Joi.object({
    ...caseStudyTemplate1Fields,
  }).unknown(false),

  caseStudyTemplate2: Joi.object({
    ...caseStudyTemplate2Fields,
  }).unknown(false),

  caseStudyMainTemplate: Joi.object({
    ...caseStudyMainFields,
  }).unknown(false),

  halalTemplate: Joi.object({
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
    ...buttonFieldsTemplate3,
  }).unknown(false),

  template4: Joi.object({
    ...baseUpdateSchema,
    ...commonOptionalFields,
    ...buttonFieldsTemplate4,
  }).unknown(false),

  sunrize2027Template: Joi.object({
    ...baseUpdateSchema,
    ...commonOptionalFields,
    ...headingFields,
    ...buttonFieldsExtended,
    ...sunrize2027TemplateFields,
  }).unknown(false),

  caseStudyTemplate1: Joi.object({
    ...caseStudyTemplate1Fields,
  }).unknown(false),

  caseStudyTemplate2: Joi.object({
    ...caseStudyTemplate2Fields,
  }).unknown(false),

  caseStudyMainTemplate: Joi.object({
    ...caseStudyMainFields,
  }).unknown(false),

  halalTemplate: Joi.object({
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
