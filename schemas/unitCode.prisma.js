import Joi from "joi";

export const unitCodeSchema = Joi.object({
  code: Joi.string().required(),
  description: Joi.string().required(),
  isActive: Joi.boolean().default(true),
});

export const unitCodeUpdateSchema = Joi.object({
  code: Joi.string(),
  description: Joi.string(),
  isActive: Joi.boolean(),
});

export const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
  sortBy: Joi.string()
    .valid("code", "description", "createdAt")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});
