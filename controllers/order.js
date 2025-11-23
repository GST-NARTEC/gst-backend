import Joi from "joi";
import {
    bankSlipNotificationQueue,
    orderActivationQueue,
    orderDeletionQueue,
} from "../config/queue.js";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const bankSlipSchema = Joi.object({
  orderNumber: Joi.string().required(),
});

class OrderController {
  static async uploadBankSlip(req, res, next) {
    let bankSlipPath;
    try {
      const { error } = bankSlipSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { orderNumber } = req.body;

      if (!req.file) {
        throw new MyError("Bank slip file is required", 400);
      }

      const order = await prisma.order.findFirst({
        where: { orderNumber },
      });

      if (!order) {
        throw new MyError("Order not found", 404);
      }

      // Add domain to file path
      if (req.file) bankSlipPath = addDomain(req.file.path);

      // If there's an existing bank slip, delete it
      if (order.bankSlip) {
        await deleteFile(order.bankSlip);
      }

      // Update order status and bank slip
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "Pending Account Activation",
          bankSlip: bankSlipPath,
        },
        include: {
          user: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      // Add job to queue, send email notification
      await bankSlipNotificationQueue.add(
        "bank-slip-notification",
        updatedOrder,
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
        }
      );

      //   // Send email notification
      //   const isSent = await EmailService.sendBankSlipNotification({
      //     email: updatedOrder.user.email,
      //     order: updatedOrder,
      //     user: updatedOrder.user,
      //   });

      //   if (!isSent) {
      //     console.log("Failed to send email notification");
      //   } else {
      //     console.log("Email notification sent successfully");
      //   }

      res.status(200).json(
        response(200, true, "Bank slip uploaded successfully", {
          //   order: updatedOrder,
          bankSlip: bankSlipPath,
          status: updatedOrder.status,
        })
      );
    } catch (error) {
      if (bankSlipPath) {
        await deleteFile(bankSlipPath);
      }
      next(error);
    }
  }

  static async deleteBankSlip(req, res, next) {
    try {
      const { orderNumber } = req.params;

      const order = await prisma.order.findFirst({
        where: { orderNumber },
      });

      if (!order) {
        throw new MyError("Order not found", 404);
      }

      if (!order.bankSlip) {
        throw new MyError("No bank slip found for this order", 404);
      }

      // Delete the physical file
      await deleteFile(order.bankSlip);

      // Update order
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          bankSlip: null,
          status: "Pending Payment",
        },
      });

      res.status(200).json(
        response(200, true, "Bank slip deleted successfully", {
          order: updatedOrder,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async activateOrderStatus(req, res, next) {
    try {
      const { orderNumber } = req.params;

      // Add job to queue
      await orderActivationQueue.add(
        "order-activation",
        { orderNumber },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
        }
      );

      res
        .status(200)
        .json(response(200, true, "Order activation is being processed"));
    } catch (error) {
      next(error);
    }
  }

  // Admin Dashboard
  static async getOrdersCount(req, res, next) {
    try {
      const ordersCount = await prisma.order.count();
      // active orders
      const activeOrdersCount = await prisma.order.count({
        where: { status: "Activated" },
      });
      // inactive orders, whose status is not "Active"
      const inactiveOrdersCount = await prisma.order.count({
        where: { status: { not: "Activated" } },
      });
      // Bank orders, whose payment type is "Bank Transfer"
      const bankOrdersCount = await prisma.order.count({
        where: { paymentType: "Bank Transfer" },
      });

      // Online orders, whose payment type is not "Bank Transfer"
      const onlineOrdersCount = await prisma.order.count({
        where: { paymentType: { not: "Bank Transfer" } },
      });

      res.status(200).json(
        response(200, true, "Orders count", {
          totalOrders: ordersCount,
          activeOrdersCount,
          inactiveOrdersCount,
          bankOrdersCount,
          onlineOrdersCount,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an order and all related data
   * This will queue the deletion job to be processed by a background worker
   */
  static async deleteOrder(req, res, next) {
    try {
      const { orderNumber } = req.params;

      // Verify order exists
      const order = await prisma.order.findFirst({
        where: { orderNumber },
      });

      if (!order) {
        throw new MyError("Order not found", 404);
      }

      // Add job to deletion queue
      await orderDeletionQueue.add(
        "order-deletion",
        { orderNumber },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
        }
      );

      res.status(200).json(
        response(200, true, "Order deletion is being processed", {
          orderNumber,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  // create an API that will get top 5 most sold products
  // we have order items table, we need to get the product id and count the quantity
  // also in order items table, we have a column called qty, we need to sum up the qty column
  // and get the top 5 most sold products
  // we need to return the product name
  // it will be used for barchart in admin dashboard
  // i need to count how many times the product is sold like how much this product id appears in the order items table + the quantity
  static async getTopSoldProducts(req, res, next) {
    try {
      const topSoldProducts = await prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      });

      // get count of each product id
      const productCounts = await prisma.orderItem.groupBy({
        by: ["productId"],
        _count: { quantity: true },
        orderBy: { _count: { quantity: "desc" } },
        take: 5,
      });

      console.log(productCounts);

      // i need to know how many times the product is sold like how much this product id appears in the order items table + the quantity
      const productNames = await prisma.product.findMany({
        where: {
          id: { in: topSoldProducts.map((product) => product.productId) },
        },
        select: { title: true, id: true },
      });

      res
        .status(200)
        .json(response(200, true, "Top sold products", productNames));
    } catch (error) {
      next(error);
    }
  }
}

export default OrderController;
