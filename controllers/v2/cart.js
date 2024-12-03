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
        addons: Joi.array().items(Joi.string().uuid()).optional(),
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

      // Check for existing anonymous cart first
      let cart = await prisma.cart.findFirst({
        where: { status: "ANONYMOUS" },
        include: {
          items: {
            include: {
              addons: true,
            },
          },
        },
      });

      // Create cart if doesn't exist
      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            status: "ANONYMOUS",
          },
          include: {
            items: {
              include: {
                addons: true,
              },
            },
          },
        });
      }

      // Verify all products and addons exist and are active
      const productIds = items.map((item) => item.productId);
      const addonIds = items.flatMap((item) => item.addons || []);

      const [products, addons] = await Promise.all([
        prisma.product.findMany({
          where: {
            id: { in: productIds },
            status: "active",
          },
        }),
        prisma.addon.findMany({
          where: {
            id: { in: addonIds },
            status: "active",
          },
        }),
      ]);

      if (products.length !== productIds.length) {
        throw new MyError("One or more products are invalid or inactive", 400);
      }

      if (addonIds.length > 0 && addons.length !== addonIds.length) {
        throw new MyError("One or more addons are invalid or inactive", 400);
      }

      // Process each item
      for (const item of items) {
        const existingItem = cart.items.find(
          (cartItem) => cartItem.productId === item.productId
        );

        if (existingItem) {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: existingItem.quantity + item.quantity,
              addons: {
                connect: (item.addons || []).map((id) => ({ id })),
              },
            },
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: item.productId,
              quantity: item.quantity,
              addons: {
                connect: (item.addons || []).map((id) => ({ id })),
              },
            },
          });
        }
      }

      // Get updated cart
      const updatedCart = await prisma.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: true,
              addons: true,
            },
          },
        },
      });

      // Calculate totals including addons
      const subtotal = updatedCart.items.reduce((sum, item) => {
        const productTotal = item.quantity * item.product.price;
        const addonsTotal =
          item.addons.reduce((acc, addon) => acc + addon.price, 0) *
          item.quantity;
        return sum + productTotal + addonsTotal;
      }, 0);

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
