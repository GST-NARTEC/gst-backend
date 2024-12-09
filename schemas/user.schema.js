import Joi from "joi";

export const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const userInfoSchema = Joi.object({
  email: Joi.string().email().required(),
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
  cartItems: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required(),
        addons: Joi.array()
          .items(
            Joi.object({
              id: Joi.string().uuid().required(),
              quantity: Joi.number().integer().min(1).required(),
            })
          )
          .optional(),
      })
    )
    .required(),
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
    .valid("orders", "cart", "invoices", "profile", "docs")
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

export const userGtinsQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  status: Joi.string().valid("Available", "Assigned", "Used").optional(),
  sortBy: Joi.string().valid("createdAt", "gtin").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

export const createWithCartAndCheckoutSchema = Joi.object({
  // User Info
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  companyNameEn: Joi.string().required(),
  companyNameAr: Joi.string().required(),
  phone: Joi.string().required(),
  countryId: Joi.string().uuid().required(),
  regionId: Joi.string().uuid().required(),
  cityId: Joi.string().uuid().required(),

  // Cart Items
  cartItems: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required(),
        addons: Joi.array().items(
          Joi.object({
            id: Joi.string().uuid().required(),
            quantity: Joi.number().integer().min(1).required(),
          })
        ),
      })
    )
    .min(1)
    .required(),

  // Checkout Info
  paymentType: Joi.string().required(),
  vat: Joi.number().min(0).default(0),
});
