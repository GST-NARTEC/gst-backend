import Joi from "joi";

export const countryOfOriginSaleSchema = Joi.object({
  name: Joi.string().required(),
});

export const countryOfOriginSaleUpdateSchema = Joi.object({
  name: Joi.string(),
});

export const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
  sortBy: Joi.string().valid("name", "createdAt").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});
