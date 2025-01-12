import express from "express";
import PaymentController from "../controllers/payment.js";

const router = express.Router();

router.post("/initialize", PaymentController.initPayment);
router.all("/success", (req, res, next) => {
  console.log("Hit: /payment/success");
  return res.redirect(`https://buybarcodeupc.com/payment/success?status=error`);
});

export default router;
