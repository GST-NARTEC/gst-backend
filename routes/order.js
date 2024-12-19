import express from "express";

import { uploadSingle } from "multermate-es";
import OrderController from "../controllers/order.js";

const router = express.Router();
const uploadSlip = uploadSingle({
  destination: "uploads/slips",
  filename: "bankSlip",
});

router.post("/bank-slip", uploadSlip, OrderController.uploadBankSlip);

router.delete("/bank-slip/:orderNumber", OrderController.deleteBankSlip);

router.patch("/activate/:orderNumber", OrderController.activateOrderStatus);

router.get("/sec/:userId", OrderController.getOrderSec);

export default router;
