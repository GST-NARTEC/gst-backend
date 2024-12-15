import Joi from "joi";

export const userDocSchema = Joi.object({
  name: Joi.string().required(),
  doc: Joi.string().optional(),
  userId: Joi.string().uuid().required(),
  docTypeId: Joi.string().uuid().optional(),
});

export const updateUserDocSchema = Joi.object({
  name: Joi.string().optional(),
  doc: Joi.string().optional(),
  docTypeId: Joi.string().uuid().optional(),
});
