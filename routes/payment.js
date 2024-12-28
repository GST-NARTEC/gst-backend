import express from "express";
import PaymentController from "../controllers/payment.js";

const router = express.Router();

router.post("/initiate", PaymentController.initiatePayment);
router.post("/response", PaymentController.handlePaymentResponse);

export default router;
