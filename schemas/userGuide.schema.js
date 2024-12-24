import Joi from "joi";

export const userGuideSchema = Joi.object({
  titleEn: Joi.string().optional(),
  titleAr: Joi.string().optional(),
  descriptionEn: Joi.string().optional(),
  descriptionAr: Joi.string().optional(),
  link: Joi.string().optional(),
  type: Joi.string().optional(),
}).unknown(true);
