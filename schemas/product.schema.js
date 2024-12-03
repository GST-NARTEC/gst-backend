import Joi from "joi";

// Validation schemas
const productSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().allow("", null),
  price: Joi.number().min(0).required(),
  image: Joi.string().allow("", null).optional(),
  categoryId: Joi.string().uuid().allow(null, "").optional(),
  qty: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid("active", "inactive").default("active"),
  addonIds: Joi.array().items(Joi.string().uuid()).optional(),
});

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
});

const productUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().allow("", null).optional(),
  price: Joi.number().min(0).optional(),
  image: Joi.string().allow("", null).optional(),
  categoryId: Joi.string().uuid().allow(null, "").optional(),
  qty: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid("active", "inactive").optional(),
  addonIds: Joi.array().items(Joi.string().uuid()).optional(),
});

export { productSchema, productUpdateSchema, querySchema };
