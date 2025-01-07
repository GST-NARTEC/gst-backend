// schemas/payment.schema.js
import Joi from "joi";

export const paymentInitiateSchema = Joi.object({
  orderId: Joi.string()

    .required()
    .messages({
      "string.guid": "Order ID must be a valid UUID v4",
      "any.required": "Order ID is required",
    }),
});

export const paymentCallbackSchema = Joi.object({
  merchant_reference: Joi.string().required(),
  fort_id: Joi.string().required(),
  status: Joi.string().required(),
  amount: Joi.string().required(),
  currency: Joi.string().required(),
  signature: Joi.string().required(),
}).unknown(true);
