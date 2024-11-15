import express from "express";
import controller from "../controllers/checkout.js";

const router = express.Router();

router.post("/process", controller.processCheckout);

export default router;
