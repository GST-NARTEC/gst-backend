import Joi from "joi";
import prisma from "../utils/prismaClient.js";

import EmailService from "../utils/email.js";
import MyError from "../utils/error.js";
import response from "../utils/response.js";

const checkoutSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  paymentType: Joi.string()
    .valid(
      "Bank Transfer",
      "Visa / Master Card",
      "Credit/Debit card",
      "STC Pay",
      "Tabby"
    )
    .required(),
});

class CheckoutController {
  static async processCheckout(req, res, next) {
    try {
      // Validate request body
      const { error, value } = checkoutSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { userId, paymentType } = value;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new MyError("User not found", 404);
      }

      // Get user's cart with items and product details
      const cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new MyError("Cart is empty", 400);
      }

      // Calculate totals
      const totalAmount = cart.items.reduce(
        (sum, item) => sum + item.quantity * item.product.price,
        0
      );
      const vat = 0;
      const overallAmount = totalAmount + vat;

      // Create order with pending status
      const order = await prisma.order.create({
        data: {
          userId,
          paymentType,
          totalAmount,
          vat,
          overallAmount,
          status: "pending", // Set initial status as pending
          orderItems: {
            create: cart.items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      // Simulate payment process here
      const paymentSuccessful = true; // Replace with actual payment processing

      if (paymentSuccessful) {
        // Update order status to completed
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "COMPLETED" },
        });

        // Generate password and update user
        const password = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma.user.update({
          where: { id: userId },
          data: { password },
        });

        // Clear cart only after successful payment
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
        await prisma.cart.delete({
          where: { id: cart.id },
        });

        // Create invoice
        const invoiceNumber = `INV-${Date.now()}-${Math.floor(
          Math.random() * 1000
        )}`;
        const invoice = await prisma.invoice.create({
          data: {
            orderId: order.id,
            invoiceNumber,
            userId,
            totalAmount,
            vat,
            overallAmount,
            paymentType,
            status: "completed",
          },
          include: {
            order: {
              include: {
                orderItems: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        });

        // Send confirmation email
        const emailSent = await EmailService.sendOrderConfirmation({
          email: cart.user.email,
          order,
          password,
          user: cart.user,
        });

        if (!emailSent) {
          throw new MyError("Failed to send confirmation email", 500);
        }

        res.status(200).json(
          response(200, true, "Order placed successfully", {
            order,
            invoice,
          })
        );
      } else {
        // If payment fails, update order status and throw error
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "failed" },
        });
        throw new MyError("Payment failed", 400);
      }
    } catch (error) {
      next(error);
    }
  }
}

export default CheckoutController;
