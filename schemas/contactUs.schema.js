import Joi from "joi";

export const contactUsSchema = Joi.object({
  name: Joi.string().allow("", null),
  email: Joi.string().email().allow("", null),
  mobile: Joi.string().allow("", null),
  companyName: Joi.string().allow("", null),
  subject: Joi.string().allow("", null),
  message: Joi.string().allow("", null),
});

export const contactUsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().allow("", null), // Optional search parameter
});
