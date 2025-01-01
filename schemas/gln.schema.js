import Joi from "joi";

export const glnSchema = Joi.object({
  identifier: Joi.string().required(),
  physicalLocation: Joi.string().allow(null, ""),
  locationNameEn: Joi.string().allow(null, ""),
  locationNameAr: Joi.string().allow(null, ""),
  addressEn: Joi.string().allow(null, ""),
  addressAr: Joi.string().allow(null, ""),
  poBox: Joi.string().allow(null, ""),
  postalCode: Joi.string().allow(null, ""),
  latitude: Joi.number().allow(null, ""),
  longitude: Joi.number().allow(null, ""),
  isActive: Joi.boolean().default(true),
  image: Joi.string().allow(null, ""),
  userId: Joi.string().optional(),
  gtin: Joi.string().allow(null, ""),
  barcodeType: Joi.string().allow(null, ""),
}).unknown(true);
