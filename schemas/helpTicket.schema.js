import Joi from "joi";

// Define enums as constants for reuse
export const Status = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
};

export const Priority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
};

export const TicketCategory = {
  ACCOUNT: "ACCOUNT",
  ORDER: "ORDER",
  PRODUCT: "PRODUCT",
  PAYMENT: "PAYMENT",
  OTHER: "OTHER",
};

export const helpTicketSchema = Joi.object({
  subject: Joi.string().required(),
  message: Joi.string().required(),
  priority: Joi.string()
    .valid(...Object.values(Priority))
    .default(Priority.MEDIUM),
  category: Joi.string()
    .valid(...Object.values(TicketCategory))
    .default(TicketCategory.OTHER),
});

export const helpTicketUpdateSchema = Joi.object({
  subject: Joi.string().optional(),
  message: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(Status))
    .optional(),
  priority: Joi.string()
    .valid(...Object.values(Priority))
    .optional(),
  category: Joi.string()
    .valid(...Object.values(TicketCategory))
    .optional(),
  response: Joi.string().optional(),
}).min(1);

export const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
  status: Joi.string()
    .valid(...Object.values(Status))
    .optional(),
  priority: Joi.string()
    .valid(...Object.values(Priority))
    .optional(),
  category: Joi.string()
    .valid(...Object.values(TicketCategory))
    .optional(),
});
