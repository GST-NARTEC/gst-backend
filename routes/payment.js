import express from "express";
import PaymentController from "../controllers/payment.js";

const router = express.Router();

router.post(
  "/initialize",
  //   verifyAccessToken,
  PaymentController.initializePayment
);

router.use("/success", PaymentController.handlePaymentSuccess);

export default router;
