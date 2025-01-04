import express from "express";
import AmazonPayController from "../controllers/amazonPay.js";

const router = express.Router();

// Payment Operations
router.post(
  "/create-payment",

  AmazonPayController.createPayment
);
router.post(
  "/process-payment",

  AmazonPayController.processPayment
);
router.get(
  "/check-payment/:fortId",

  AmazonPayController.checkPaymentStatus
);

// Refund Operations
router.post("/refund", AmazonPayController.createRefund);

// Payment Methods
router.get(
  "/installment-plans",

  AmazonPayController.getInstallmentPlans
);
router.post(
  "/tokenization",

  AmazonPayController.createTokenization
);

export default router;
