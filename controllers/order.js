import Joi from "joi";
import { orderActivationQueue } from "../config/queue.js";
import EmailService from "../utils/email.js";
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

      // Send email notification
      await EmailService.sendBankSlipNotification({
        email: updatedOrder.user.email,
        order: updatedOrder,
        user: updatedOrder.user,
      });

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
        "activate-order",
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
}

export default OrderController;
