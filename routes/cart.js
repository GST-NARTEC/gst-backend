import express from "express";
import controller from "../controllers/cart.js";

const router = express.Router();

router.post("/add", controller.addToCart);

export default router;
