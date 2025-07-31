import Joi from "joi";

export const userGuideSchema = Joi.object({
  titleEn: Joi.string(),
  titleAr: Joi.string(),
  descriptionEn: Joi.string().optional(),
  descriptionAr: Joi.string().optional(),
  type: Joi.string().required().valid("pdf", "video"),
}).unknown(true);
