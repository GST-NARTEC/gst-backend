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
        addons: Joi.array()
          .items(
            Joi.object({
              id: Joi.string().uuid().required(),
              quantity: Joi.number().integer().min(1).required(),
            })
          )
          .optional(),
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

      // Delete old anonymous carts first
      await prisma.cart.deleteMany({
        where: {
          status: "ANONYMOUS",
          createdAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
          userId: null, // Only delete carts without users
        },
      });

      // Create a new cart without userId
      let cart = await prisma.cart.create({
        data: {
          status: "ANONYMOUS",
          userId: null, // Explicitly set userId to null
        },
        include: {
          items: {
            include: {
              addonItems: {
                include: {
                  addon: true,
                },
              },
              product: true,
            },
          },
        },
      });

      // Verify all products and addons exist and are active
      const productIds = items.map((item) => item.productId);
      const addonIds = items.flatMap((item) =>
        (item.addons || []).map((addon) => addon.id)
      );

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

      console.log(products, addons);

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
          // Update existing cart item
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: existingItem.quantity + item.quantity,
            },
          });

          // Process addons for existing item
          if (item.addons) {
            for (const addon of item.addons) {
              const existingAddon = existingItem.addonItems.find(
                (ai) => ai.addonId === addon.id
              );

              if (existingAddon) {
                await prisma.cartItemAddon.update({
                  where: { id: existingAddon.id },
                  data: {
                    quantity: existingAddon.quantity + addon.quantity,
                  },
                });
              } else {
                await prisma.cartItemAddon.create({
                  data: {
                    cartItemId: existingItem.id,
                    addonId: addon.id,
                    quantity: addon.quantity,
                  },
                });
              }
            }
          }
        } else {
          // Create new cart item with addons
          const cartItem = await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: item.productId,
              quantity: item.quantity,
              addonItems: {
                create: (item.addons || []).map((addon) => ({
                  addonId: addon.id,
                  quantity: addon.quantity,
                })),
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
              addonItems: {
                include: {
                  addon: true,
                },
              },
            },
          },
        },
      });

      // Calculate totals including addons
      const subtotal = updatedCart.items.reduce((sum, item) => {
        const productTotal = item.quantity * item.product.price;
        const addonsTotal = item.addonItems.reduce(
          (acc, addonItem) => acc + addonItem.addon.price * addonItem.quantity,
          0
        );
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
