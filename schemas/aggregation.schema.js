// schemas/aggregation.schema.js
import Joi from "joi";

export const aggregationSchema = Joi.object({
  gtin: Joi.string().required(),
  qty: Joi.number().integer().min(0),
  batchNo: Joi.string().allow("", null),
  manufacturingDate: Joi.date().optional(),
  expiryDate: Joi.date().optional(),
});

export const aggregationUpdateSchema = Joi.object({
  qty: Joi.number().integer().min(0).optional(),
  batchNo: Joi.string().allow("", null).optional(),
  manufacturingDate: Joi.date().optional(),
  expiryDate: Joi.date().optional(),
});

export const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
  sortBy: Joi.string()
    .valid("qty", "batchNo", "manufacturingDate", "expiryDate", "createdAt")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});
