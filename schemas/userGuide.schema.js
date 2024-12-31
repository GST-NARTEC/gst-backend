import Joi from "joi";

export const userGuideSchema = Joi.object({
  titleEn: Joi.string().required(),
  titleAr: Joi.string().required(),
  descriptionEn: Joi.string().required(),
  descriptionAr: Joi.string().required(),
  type: Joi.string().required().valid("pdf", "video"),
}).unknown(true);
