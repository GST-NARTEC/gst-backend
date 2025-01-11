import express from "express";
import PaymentController from "../controllers/payment.js";

const router = express.Router();

router.post("/success", PaymentController.handlePaymentSuccess);
router.post("/initialize", PaymentController.initializePayment);
router.post("/initialize-payment", PaymentController.initPayment);
router.all("/payment/success", PaymentController.successPayment);

export default router;
