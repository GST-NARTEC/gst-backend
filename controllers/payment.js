// controllers/payment.js
import PAYFORT_CONFIG from "../config/payfort.js";
import { generateSignature } from "../utils/generatePayfortSign.js";
import { generateOrderId } from "../utils/generateUniqueId.js";
import prisma from "../utils/prismaClient.js";

class PaymentController {
  static async initPayment(req, res) {
    try {
      const { amount, customerEmail, customerName, pageType, currency } =
        req.body;

      const merchantReference = generateOrderId();

      const requestParams = {
        command: "PURCHASE",
        merchant_identifier: PAYFORT_CONFIG.merchant_identifier,
        access_code: PAYFORT_CONFIG.access_code,
        merchant_reference: merchantReference,
        language: "en",
        amount: (amount * 100).toString(),
        currency: currency,
        customer_email: customerEmail,
        customer_name: customerName,
        merchant_extra: pageType || "default",
        return_url: `https://api.gstsa1.org/api/v1/payment/success`,
        // return_url: `http://localhost:3000/api/v1/payment/success`,
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

      // Define base URLs for different page types
      const redirectUrls = {
        registration: "https://buybarcodeupc.com/payment/success",
        adminPortal: "https://gstsa1.org/admin/members/payment/success",
        memberPortal: "https://buybarcodeupc.com/member-portal/payment/success",
        default: "https://buybarcodeupc.com/payment/success",
      };

      // const redirectUrls = {
      //   registration: "http://localhost:5173/payment/success",
      //   adminPortal: "http://localhost:5173/admin/members/payment/success",
      //   memberPortal: "http://localhost:5173/member-portal/payment/success",
      //   default: "http://localhost:5173/payment/success",
      // };

      // Get the page type from merchant_extra
      const pageType = req.body.merchant_extra || "default";
      let redirectUrl = redirectUrls[pageType] || redirectUrls.default;

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

      // save data in the database
      await prisma.payment.create({
        data: { ...paymentData, amount: parseFloat(paymentData.amount) },
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
