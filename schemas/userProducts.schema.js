import Joi from "joi";

export const userProductSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(null, ""),
  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
  sku: Joi.string().required(),
  gtin: Joi.string().allow(null, ""),
  gpc: Joi.string().allow(null, ""),
  hsCode: Joi.string().allow(null, ""),
  packingUnit: Joi.string().allow(null, ""),
  unitOfMeasure: Joi.string().allow(null, ""),
  brandName: Joi.string().allow(null, ""),
  countryOfOrigin: Joi.string().allow(null, ""),
  countryOfSale: Joi.string().allow(null, ""),
}).unknown(true);
