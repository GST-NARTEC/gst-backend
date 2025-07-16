import Joi from "joi";

const companySchema = Joi.object({
  icon: Joi.string().allow("", null),
  titleEn: Joi.string().allow("", null),
  titleAr: Joi.string().allow("", null),
  descriptionEn: Joi.string().allow("", null),
  descriptionAr: Joi.string().allow("", null),
  websiteLink: Joi.string().uri().allow("", null),
  isActive: Joi.boolean().default(true),
});

export default companySchema;
