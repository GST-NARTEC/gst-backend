import express from "express";
import CartControllerV2 from "../../controllers/v2/cart.js";

const router = express.Router();

router.post("/add", CartControllerV2.addToCart);

export default router;
