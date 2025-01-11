// controllers/payment.js
import PAYFORT_CONFIG from "../config/payfort.js";
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
        amount: amount.toString(),
        currency,
        customer_email: customerEmail,
        customer_name: customerName,
        // return_url: "https://gstsa1.org/api/v1/payment/success",
        return_url: "http://localhost:3000/api/v1/payment/success",
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
        status: req.body.status,
        transactionId: req.body.fort_id,
        amount: req.body.amount,
        merchantReference: req.body.merchant_reference,
        // Add other relevant fields
      };

      // Handle different response statuses
      let redirectUrl = "http://localhost:5173/payment/success";

      switch (req.body.status) {
        case "14": // Success
          redirectUrl += `?status=success&transactionId=${req.body.fort_id}&orderNumber=${req.body.merchant_reference}`;
          break;
        case "12": // On hold
          redirectUrl += `?status=pending&transactionId=${req.body.fort_id}&orderNumber=${req.body.merchant_reference}`;
          break;
        default:
          redirectUrl += `?status=failed`;
      }

      // If it's a direct browser redirect (not a notification)
      if (
        req.headers["user-agent"] &&
        req.headers["user-agent"].includes("Mozilla")
      ) {
        return res.redirect(redirectUrl);
      }

      // If it's a notification from PayFort
      return res.json({ status: "success" });
    } catch (error) {
      console.error("Payment callback error:", error);
      return res.redirect(`http://localhost:5173/payment/success?status=error`);
    }
  }
}

export default PaymentController;
