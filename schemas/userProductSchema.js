import Joi from "joi";

export const userProductSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(null, ""),
  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
  sku: Joi.string()
    .allow(null, "")
    .custom((value, helpers) => {
      if (value === null || value === "") return value;
      return String(value).trim();
    }),
  //   gtin: Joi.string().allow(null, ""),
  gpc: Joi.string().allow(null, ""),
  hsCode: Joi.string().allow(null, ""),
  packagingType: Joi.string().allow(null, ""),
  unitOfMeasure: Joi.string().allow(null, ""),
  brandName: Joi.string().allow(null, ""),
  countryOfOrigin: Joi.string().allow(null, ""),
  countryOfSale: Joi.string().allow(null, ""),
  productType: Joi.string().allow(null, ""),
  isSec: Joi.boolean().default(false),
  barcodeType: Joi.string().allow(null, ""),
}).unknown(true);

export const bulkImportSchema = Joi.object({
  products: Joi.array()
    .items(userProductSchema)
    .min(1)
    .max(1000)
    .required()
    .messages({
      "array.min": "At least one product is required",
      "array.max": "Maximum 1000 products allowed per import",
      "any.required": "Products array is required",
    }),
});
