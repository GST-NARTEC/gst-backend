import bcrypt from "bcrypt";
import Joi from "joi";
import prisma from "../utils/prismaClient.js";

import EmailService from "../utils/email.js";
import MyError from "../utils/error.js";
import { addDomain } from "../utils/file.js";
import { generatePassword } from "../utils/generatePassword.js";
import PDFGenerator from "../utils/pdfGenerator.js";
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
      // Validate request body
      const { error, value } = checkoutSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { userId, paymentType, vat } = value;

      const activeVat = await prisma.vat.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });

      if (!activeVat) {
        throw new MyError("No active VAT configuration found", 400);
      }

      const activeCurrency = await prisma.currency.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (!activeCurrency) {
        throw new MyError("No active currency configuration found", 400);
      }

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
              addonItems: {
                include: {
                  addon: true,
                },
              },
            },
          },
          user: true,
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new MyError("Cart is empty", 400);
      }

      // Calculate totals including tax
      const totalAmount = cart.items.reduce((sum, item) => {
        const productTotal = item.quantity * item.product.price;
        const addonsTotal = item.addonItems.reduce(
          (acc, addonItem) => acc + addonItem.addon.price * addonItem.quantity,
          0
        );
        return sum + productTotal + addonsTotal;
      }, 0);

      // Add VAT if provided
      //   const vatAmount = totalAmount * (vat / 100);
      const vatAmount = vat;
      const overallAmount = totalAmount + vatAmount;

      // Create order with items and their addons
      const order = await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          paymentType,
          totalAmount,
          vat: vatAmount,
          overallAmount,
          status: "Pending Payment",
          orderItems: {
            create: cart.items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price,
              ...(item.addons && item.addons.length > 0
                ? {
                    addons: {
                      connect: item.addons.map((addon) => ({ id: addon.id })),
                    },
                  }
                : {}),
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
              addons: true,
            },
          },
        },
      });

      // Generate password and update user
      const password = generatePassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          isCreated: true,
        },
      });

      // First delete cart item addons, then cart items, then cart
      await prisma.$transaction(async (prisma) => {
        // Delete all cart item addons first
        for (const item of cart.items) {
          await prisma.cartItemAddon.deleteMany({
            where: { cartItemId: item.id },
          });
        }

        // Then delete cart items
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        // Finally delete the cart
        await prisma.cart.delete({
          where: { id: cart.id },
        });
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
          vat: vatAmount,
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

      // Generate PDF with invoice details
      const pdfResult = await PDFGenerator.generateInvoice(
        order,
        cart.user,
        invoice
      );

      // Update the invoice with the PDF path
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          pdf: addDomain(pdfResult.relativePath),
        },
      });

      // Send confirmation email
      const emailSent = await EmailService.sendWelcomeEmail({
        email: cart.user.email,
        order,
        password,
        user: cart.user,
        currency: {
          symbol: activeCurrency.symbol,
          name: activeCurrency.name,
        },
        tax: {
          value: activeVat.value,
        },
        attachments: [
          {
            filename: "invoice.pdf",
            path: pdfResult.absolutePath,
          },
        ],
      });

      if (!emailSent) {
        throw new MyError("Failed to send confirmation email", 500);
      }

      res.status(200).json(response(200, true, "Order placed successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default CheckoutController;
