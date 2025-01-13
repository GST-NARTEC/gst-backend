import express from "express";

import PaymentController from "../controllers/payment.js";

const router = express.Router();

router.all("/success", PaymentController.successPayment);
router.post("/initialize", PaymentController.initPayment);

export default router;
