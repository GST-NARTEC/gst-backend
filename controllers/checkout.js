import Joi from "joi";
import prisma from "../utils/prismaClient.js";

import { checkoutQueue } from "../config/queue.js";
import MyError from "../utils/error.js";
import response from "../utils/response.js";

const checkoutSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  paymentType: Joi.string()
    // .valid(
    //   "Bank Transfer",
    //   "Visa / Master Card",
    //   "Credit/Debit card",
    //   "STC Pay",
    //   "Tabby"
    // )
    .required(),
  vat: Joi.number().min(0).default(0),
});

const generateOrderNumber = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "ORD";
  // Generate 7 random characters (ORD + 7 = 10 characters total)
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

class CheckoutController {
  static async processCheckout(req, res, next) {
    try {
      const { error, value } = checkoutSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { userId, paymentType, vat } = value;

      const [activeVat, activeCurrency, user, cart] = await Promise.all([
        prisma.vat.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.currency.findFirst({
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.findUnique({
          where: { id: userId },
        }),
        prisma.cart.findFirst({
          where: { userId },
          include: {
            items: {
              include: {
                product: true,
                addonItems: {
                  include: {
                    addon: true,
                  },
                },
              },
            },
            user: true,
          },
        }),
      ]);

      // Validations
      if (!activeVat)
        throw new MyError("No active VAT configuration found", 400);
      if (!activeCurrency)
        throw new MyError("No active currency configuration found", 400);
      if (!user) throw new MyError("User not found", 404);
      if (!cart || cart.items.length === 0)
        throw new MyError("Cart is empty", 400);

      // Add job to queue
      await checkoutQueue.add(
        "process-checkout",
        {
          cart,
          user,
          paymentType,
          vat,
          activeVat,
          activeCurrency,
          orderNumber: generateOrderNumber(),
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
        }
      );

      res.status(200).json(response(200, true, "Order is being processed"));
    } catch (error) {
      next(error);
    }
  }
}

export default CheckoutController;
