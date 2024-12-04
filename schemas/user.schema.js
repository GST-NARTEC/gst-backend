import Joi from "joi";

export const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const userInfoSchema = Joi.object({
  email: Joi.string().email().required(),
  cartId: Joi.string().uuid().optional(),
  companyLicenseNo: Joi.string().required(),
  companyNameEn: Joi.string().required(),
  companyNameAr: Joi.string().required(),
  landline: Joi.string().allow("", null),
  mobile: Joi.string().required(),
  country: Joi.string().required(),
  region: Joi.string().required(),
  city: Joi.string().required(),
  zipCode: Joi.string().required(),
  streetAddress: Joi.string().required(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  isActive: Joi.boolean().default(true),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const searchSchema = Joi.object({
  search: Joi.string().allow("").optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid("email", "companyNameEn", "createdAt")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

export const userDetailsSchema = Joi.object({
  fields: Joi.string()
    .valid("orders", "cart", "invoices", "profile")
    .optional(),
});

export const userUpdateSchema = Joi.object({
  companyLicenseNo: Joi.string(),
  companyNameEn: Joi.string(),
  companyNameAr: Joi.string(),
  landline: Joi.string().allow("", null),
  mobile: Joi.string(),
  country: Joi.string(),
  region: Joi.string(),
  city: Joi.string(),
  zipCode: Joi.string(),
  streetAddress: Joi.string(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  isActive: Joi.boolean(),
}).min(1);
