import express from "express";
import PaymentController from "../controllers/payment.js";

const router = express.Router();

router.all("/payment/success", PaymentController.successPayment);
router.post("/api/v1/payment/initialize", PaymentController.initPayment);

export default router;
