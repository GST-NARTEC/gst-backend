// controllers/payment.js
import PAYFORT_CONFIG from "../config/payfort.js";
import prisma from "../utils/prismaClient.js";
import { generateSignature } from "../utils/generatePayfortSign.js";
import { generateOrderId } from "../utils/generateUniqueId.js";

class PaymentController {
  static async initPayment(req, res) {
    try {
      const { amount, currency, customerEmail, customerName } = req.body;

      // const merchantReference = `ORDER-${Date.now()}-${Math.random()
      //   .toString(36)
      //   .substring(7)}`;

      const merchantReference = generateOrderId();

      const requestParams = {
        command: "PURCHASE",
        merchant_identifier: PAYFORT_CONFIG.merchant_identifier,
        access_code: PAYFORT_CONFIG.access_code,
        merchant_reference: merchantReference,
        language: "en",
        amount: (amount * 100).toString(),
        currency,
        customer_email: customerEmail,
        customer_name: customerName,
        return_url: `https://api.gstsa1.org/api/v1/payment/success`,
      };

      requestParams.signature = generateSignature(
        requestParams,
        PAYFORT_CONFIG.sha_request_phrase
      );

      res.json({
        paymentData: requestParams,
        gatewayUrl: PAYFORT_CONFIG.sandbox_mode
          ? "https://sbcheckout.payfort.com/FortAPI/paymentPage"
          : "https://checkout.payfort.com/FortAPI/paymentPage",
      });
    } catch (error) {
      console.error("Payment initialization error:", error);
      res.status(500).json({ error: "Payment initialization failed" });
    }
  }

  static async successPayment(req, res) {
    try {
      console.log("Payment callback received:", req.body);
      const responseSignature = req.body.signature;
      const receivedParams = { ...req.body };
      delete receivedParams.signature;

      const calculatedSignature = generateSignature(
        receivedParams,
        PAYFORT_CONFIG.sha_response_phrase
      );

      // Store payment response data (recommended)
      const paymentData = {
        // Order identifiers
        merchantReference: req.body.merchant_reference,
        fortId: req.body.fort_id,

        // Payment details
        amount: req.body.amount,
        currency: req.body.currency,

        // Transaction status
        responseCode: req.body.response_code,
        responseMessage: req.body.response_message,
        authorizationCode: req.body.authorization_code,
        status: req.body.status,

        // Payment method
        paymentOption: req.body.payment_option,
        cardNumber: req.body.card_number,
        cardHolderName: req.body.card_holder_name,

        // Customer information
        customerEmail: req.body.customer_email,
        customerName: req.body.customer_name,
        customerIp: req.body.customer_ip,

        // Security and transaction type
        eci: req.body.eci,
        command: req.body.command,

        // Gateway identifiers
        merchantIdentifier: req.body.merchant_identifier,
        accessCode: req.body.access_code,
      };

      // Handle different response statuses
      let redirectUrl = "https://buybarcodeupc.com/payment/success";

      switch (req.body.status) {
        case "14": // Success
          console.log("case 14");
          redirectUrl += `?status=success&transactionId=${req.body.fort_id}&orderNumber=${req.body.merchant_reference}`;
          break;
        case "12": // On hold
          console.log("case 12");
          redirectUrl += `?status=pending&transactionId=${req.body.fort_id}&orderNumber=${req.body.merchant_reference}`;
          break;
        default:
          console.log("case default");
          redirectUrl += `?status=failed`;
      }

      // Check if it's a browser request or a PayFort notification
      const isBrowserRequest =
        req.headers["user-agent"] &&
        req.headers["user-agent"].includes("Mozilla");

      // get order by orderNumber
      const order = await prisma.order.findFirst({
        where: {
          orderNumber: req.body.merchant_reference,
        },
      });

      // Add null check for order
      if (!order) {
        console.error(
          `No order found for merchant_reference: ${req.body.merchant_reference}`
        );
        return res.redirect(
          `https://buybarcodeupc.com/payment/success?status=error&message=order_not_found`
        );
      }

      // save data in the database
      await prisma.payment.create({
        data: {
          ...paymentData,
          orderId: order.id,
        },
      });

      if (isBrowserRequest) {
        res.redirect(redirectUrl);
      } else {
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error("Payment callback error:", error);
      // Check if headers haven't been sent before redirecting
      if (!res.headersSent) {
        res.redirect(`https://buybarcodeupc.com/payment/success?status=error`);
      }
    }
  }
}

export default PaymentController;
