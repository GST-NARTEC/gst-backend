import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class CartController {
  static async addToCart(req, res, next) {
    try {
      const { userId, items } = req.body;

      // Find or create cart for user
      let cart = await prisma.cart.findFirst({
        where: { userId },
        include: { items: true },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
          include: { items: true },
        });
      }

      // Process each item
      for (const item of items) {
        const existingItem = cart.items.find(
          (cartItem) => cartItem.productId === item.productId
        );

        if (existingItem) {
          // Update quantity if product already exists
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + item.quantity },
          });
        } else {
          // Add new cart item
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
              product: true,
            },
          },
        },
      });

      res.status(200).json(
        response(200, true, "Items added to cart successfully", {
          cart: updatedCart,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default CartController;
