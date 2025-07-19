// import Joi from "joi";
// import MyError from "../utils/error.js";

// // Base schemas with common fields
// const baseCaseStudyTemplateSchema = {
//   nameEn: Joi.string().allow(null),
//   nameAr: Joi.string().allow(null),
//   isActive: Joi.boolean().default(true),
//   pageId: Joi.string().allow(null),
// };

// const baseCaseStudyUpdateSchema = {
//   nameEn: Joi.string().allow(null),
//   nameAr: Joi.string().allow(null),
//   isActive: Joi.boolean(),
//   pageId: Joi.string().allow(null),
// };

// // Common optional fields for case studies
// const commonOptionalFields = {
//   seoDescriptionEn: Joi.string().allow("", null),
//   seoDescriptionAr: Joi.string().allow("", null),
//   headingEn: Joi.string().allow("", null),
//   headingAr: Joi.string().allow("", null),
//   description1En: Joi.string().allow("", null),
//   description1Ar: Joi.string().allow("", null),
//   description2En: Joi.string().allow("", null),
//   description2Ar: Joi.string().allow("", null),
//   description3En: Joi.string().allow("", null),
//   description3Ar: Joi.string().allow("", null),
//   description4En: Joi.string().allow("", null),
//   description4Ar: Joi.string().allow("", null),
//   image1: Joi.string().allow("", null),
//   image2: Joi.string().allow("", null),
//   image3: Joi.string().allow("", null),
//   resultImpactEn: Joi.string().allow("", null),
//   resultImpactAr: Joi.string().allow("", null),
//   technologiesUsedEn: Joi.string().allow("", null),
//   technologiesUsedAr: Joi.string().allow("", null),
// };

// // Template specific schemas
// const caseStudyTemplateSchemas = {
//   caseStudyTemplate1: Joi.object({
//     ...baseCaseStudyTemplateSchema,
//     ...commonOptionalFields,
//   }).unknown(false),

//   caseStudyTemplate2: Joi.object({
//     ...baseCaseStudyTemplateSchema,
//     ...commonOptionalFields,
//   }).unknown(false),
// };

// // Update schemas
// const caseStudyTemplateUpdateSchemas = {
//   caseStudyTemplate1: Joi.object({
//     ...baseCaseStudyUpdateSchema,
//     ...commonOptionalFields,
//   }).unknown(false),

//   caseStudyTemplate2: Joi.object({
//     ...baseCaseStudyUpdateSchema,
//     ...commonOptionalFields,
//   }).unknown(false),
// };

// const caseStudyTemplateTypeSchema = Joi.object({
//   templateType: Joi.string()
//     .required()
//     .valid("caseStudyTemplate1", "caseStudyTemplate2"),
// });

// const getCaseStudySchemaForType = (templateType) => {
//   const schema = caseStudyTemplateSchemas[templateType];
//   if (!schema) {
//     throw new MyError(`Invalid case study template type: ${templateType}`, 400);
//   }
//   return schema;
// };

// const getCaseStudyUpdateSchemaForType = (templateType) => {
//   const schema = caseStudyTemplateUpdateSchemas[templateType];
//   if (!schema) {
//     throw new MyError(`Invalid case study template type: ${templateType}`, 400);
//   }
//   return schema;
// };

// export {
//   caseStudyTemplateTypeSchema,
//   getCaseStudySchemaForType,
//   getCaseStudyUpdateSchemaForType,
// };
