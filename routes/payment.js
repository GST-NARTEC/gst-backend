import express from "express";
import PaymentController from "../controllers/payment.js";

const router = express.Router();

router.use("/success", (req, res, next) => {
  console.log("Hit: /payment/success");
  return res.redirect(`https://www.google.com`);
});
router.post("/initialize", PaymentController.initPayment);

export default router;
