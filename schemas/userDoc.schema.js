import Joi from "joi";

export const userDocSchema = Joi.object({
  name: Joi.string().required(),
  doc: Joi.string().optional(),
  userId: Joi.string().uuid().required(),
});

export const updateUserDocSchema = Joi.object({
  name: Joi.string().optional(),
  doc: Joi.string().optional(),
});
