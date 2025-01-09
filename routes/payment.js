import express from "express";
import PaymentController from "../controllers/payment.js";

const router = express.Router();

router.post("/success", PaymentController.handlePaymentSuccess);
router.post("/initialize", PaymentController.initializePayment);

export default router;
