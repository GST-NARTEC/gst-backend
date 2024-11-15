import { PrismaClient } from "@prisma/client";
import EmailService from "../utils/email.js";
import MyError from "../utils/error.js";
import response from "../utils/response.js";

const prisma = new PrismaClient();

class CheckoutController {
  static async processCheckout(req, res, next) {
    try {
      const { userId, paymentType } = req.body;

      // Get user's cart with items and product details
      const cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
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
      const vat = 0; // For now it's 0
      const overallAmount = totalAmount + vat;

      // Create order
      const order = await prisma.order.create({
        data: {
          userId,
          paymentType,
          totalAmount,
          vat,
          overallAmount,
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

      // Generate random numeric password
      const password = Math.floor(100000 + Math.random() * 900000).toString();

      // Update user with password
      await prisma.user.update({
        where: { id: userId },
        data: { password },
      });

      // Clear user's cart
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      await prisma.cart.delete({
        where: { id: cart.id },
      });

      // Send email
      const emailSent = await EmailService.sendOrderConfirmation({
        email: cart.user.email,
        order,
        password,
      });

      if (!emailSent) {
        throw new MyError("Failed to send confirmation email", 500);
      }

      const invoiceNumber = `INV-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      // Save Invoice

      const invoice = await prisma.invoice.create({
        data: {
          orderId: order.id,
          invoiceNumber,
          userId,
          totalAmount,
          vat,
          overallAmount,
          paymentType,
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

      res.status(200).json(
        response(200, true, "Order placed successfully", {
          order,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default CheckoutController;
