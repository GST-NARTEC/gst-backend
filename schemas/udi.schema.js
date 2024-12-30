import Joi from "joi";

export const udiSchema = Joi.object({
  gtin: Joi.string().required(),
  batchNo: Joi.string().allow("", null),
  expiryDate: Joi.date().optional(),
  qty: Joi.number().min(1).default(1),
});

export const udiUpdateSchema = Joi.object({
  batchNo: Joi.string().allow("", null).optional(),
  expiryDate: Joi.date().optional(),
});

export const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
  gtin: Joi.string().allow("", null),
  sortBy: Joi.string()
    .valid("batchNo", "expiryDate", "createdAt")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});
