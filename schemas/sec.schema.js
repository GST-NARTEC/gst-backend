// schemas/sec.schema.js
import Joi from "joi";

export const secSchema = Joi.object({
  materialNo: Joi.string().allow("", null),
  purchaseOrder: Joi.string().allow("", null),
  vendor: Joi.string().allow("", null),
  serialNo: Joi.string().allow("", null),
  date: Joi.date().allow(null),
  text: Joi.string().allow("", null),
  gtin: Joi.string().required(),
});

export const secUpdateSchema = Joi.object({
  materialNo: Joi.string().allow("", null),
  purchaseOrder: Joi.string().allow("", null),
  vendor: Joi.string().allow("", null),
  serialNo: Joi.string().allow("", null),
  date: Joi.date().allow(null),
  text: Joi.string().allow("", null),
  gtin: Joi.string().allow("", null),
});

export const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
});
