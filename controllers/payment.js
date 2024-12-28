import PayfortService from "../services/payfort.service.js";
import response from "../utils/response.js";

class PaymentController {
  async initiatePayment(req, res, next) {
    try {
      const orderData = {
        amount: req.body.amount,
        email: req.body.email,
        referenceId: `ORDER-${Date.now()}`,
      };

      const paymentPage = await PayfortService.createPaymentPage(orderData);

      // Return payment form data
      return res.json(response(200, true, "Payment initiated", paymentPage));
    } catch (error) {
      next(error);
    }
  }

  async handlePaymentResponse(req, res, next) {
    try {
      const verificationResult = PayfortService.verifyResponse(req.body);

      if (verificationResult.isSuccess) {
        // Update order status in your database
        // Send confirmation email
        // return res.redirect("/payment/success");
        return res.json(
          response(200, true, "Payment successful", verificationResult)
        );
      } else {
        // return res.redirect("/payment/failure");
        return res.json(
          response(400, false, "Payment failed", verificationResult)
        );
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();
