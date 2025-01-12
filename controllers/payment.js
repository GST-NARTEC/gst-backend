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
        amount: (amount * 100).toString(),
        currency,
        customer_email: customerEmail,
        customer_name: customerName,
        return_url: `https://api.gstsa1.org/payment/success`
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
    res.send("Payment")
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

      if (isBrowserRequest) {
        res.redirect(redirectUrl);
      } else {
        res.json({ status: "success" });
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
