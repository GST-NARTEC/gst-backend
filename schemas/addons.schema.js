import Joi from "joi";

const addonSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  unit: Joi.string().required(),
  status: Joi.string().valid("active", "inactive").default("active"),
  stock: Joi.number().integer().min(0).default(0),
});

const addonUpdateSchema = Joi.object({
  name: Joi.string(),
  price: Joi.number().min(0),
  unit: Joi.string(),
  status: Joi.string().valid("active", "inactive"),
  stock: Joi.number().integer().min(0),
}).min(1);

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
  sortBy: Joi.string().valid("name", "price", "createdAt").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

export { addonSchema, addonUpdateSchema, querySchema };
