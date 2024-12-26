import Joi from "joi";

export const packagingTypeSchema = Joi.object({
  nameEn: Joi.string().required(),
  nameAr: Joi.string().required(),
});

export const packagingTypeUpdateSchema = Joi.object({
  nameEn: Joi.string(),
  nameAr: Joi.string(),
});

export const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
  sortBy: Joi.string()
    .valid("nameEn", "nameAr", "createdAt")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});
