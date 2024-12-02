import Joi from "joi";
import MyError from "../../utils/error.js";
import prisma from "../../utils/prismaClient.js";
import response from "../../utils/response.js";

// Validation schema
const addToCartSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
});

class CartControllerV2 {
  static async addToCart(req, res, next) {
    try {
      // Validate request body
      const { error, value } = addToCartSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { items } = value;

      // Create new anonymous cart
      cart = await prisma.cart.create({
        data: {
          status: "ANONYMOUS",
        },
        include: { items: true },
      });

      // Verify all products exist and are active
      const productIds = items.map((item) => item.productId);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true,
        },
      });

      if (products.length !== productIds.length) {
        throw new MyError("One or more products are invalid or inactive", 400);
      }

      // Process each item
      for (const item of items) {
        const existingItem = cart.items.find(
          (cartItem) => cartItem.productId === item.productId
        );

        if (existingItem) {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + item.quantity },
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: item.productId,
              quantity: item.quantity,
            },
          });
        }
      }

      // Get updated cart with items and product details
      const updatedCart = await prisma.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  description: true,
                  image: true,
                  isActive: true,
                },
              },
            },
          },
        },
      });

      // Calculate cart totals
      const subtotal = updatedCart.items.reduce(
        (sum, item) => sum + item.quantity * item.product.price,
        0
      );

      res.status(200).json(
        response(200, true, "Items added to cart successfully", {
          cart: {
            ...updatedCart,
            subtotal,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default CartControllerV2;
