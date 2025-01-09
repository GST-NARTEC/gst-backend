// controllers/payment.js
import MyError from "../utils/error.js";
import PayfortService from "../utils/payfort.js";
import response from "../utils/response.js";

class PaymentController {
  static async initializePayment(req, res, next) {
    try {
      const { orderId, amount, email, currency = "SAR" } = req.body;

      if (!orderId || !amount || !email) {
        throw new MyError("Missing required parameters", 400);
      }

      // Prepare payment request
      const paymentData = PayfortService.preparePaymentRequest({
        orderId,
        amount,
        email,
        currency,
      });

      // Return the form parameters and URL
      return res.json(response(200, true, "Payment initialized", paymentData));
    } catch (error) {
      console.error("Payment initialization error:", error);
      next(error);
    }
  }

  static async handlePaymentSuccess(req, res, next) {
    try {
      // redirect to my website
      return res.redirect("https://buybarcodeupc.com/success");
    } catch (error) {
      console.error("Payment response error:", error);
      next(error);
    }
  }
}

export default PaymentController;
