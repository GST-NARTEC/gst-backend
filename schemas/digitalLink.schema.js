import Joi from "joi";

export const digitalLinkSchema = Joi.object({
  name: Joi.string().required(),
  url: Joi.string().uri().required(),
  description: Joi.string().allow("", null),
  isActive: Joi.boolean().default(true),
});

export const digitalLinkUpdateSchema = Joi.object({
  name: Joi.string(),
  url: Joi.string().uri(),
  description: Joi.string().allow("", null),
  isActive: Joi.boolean(),
});

export const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
  sortBy: Joi.string().valid("name", "createdAt").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});
