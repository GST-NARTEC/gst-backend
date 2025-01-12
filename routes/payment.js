import express from "express";
import PaymentController from "../controllers/payment.js";

const router = express.Router();

router.post("/initialize", PaymentController.initPayment);
router.all(
  "/success",
  (req, res, next) => {
    console.log("Hit: /payment/success");
    next();
  },
  PaymentController.successPayment
);

export default router;
