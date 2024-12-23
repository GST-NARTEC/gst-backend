import Joi from "joi";

export const gtinQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
  status: Joi.string().valid("Available", "Sold", "Used").optional(),
  sortBy: Joi.string()
    .valid("gtin", "createdAt", "updatedAt", "status")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

export const gtinArraySchema = Joi.object({
  gtins: Joi.array().items(Joi.string()).min(1).required(),
});
