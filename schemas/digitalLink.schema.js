import Joi from "joi";

export const digitalLinkSchema = Joi.object({
  url: Joi.string().uri().required(),
  digitalType: Joi.string().required(),
  gtin: Joi.string().required(),
});

export const digitalLinkUpdateSchema = Joi.object({
  url: Joi.string().uri(),
  digitalType: Joi.string(),
  gtin: Joi.string(),
});

export const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
  sortBy: Joi.string()
    .valid("url", "digitalType", "gtin", "createdAt")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});
