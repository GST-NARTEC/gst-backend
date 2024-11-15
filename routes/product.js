import express from "express";
import controller from "../controllers/product.js";

const router = express.Router();

router.post("/", controller.createProduct);
router.get("/", controller.getProducts);
router.get("/:id", controller.getProduct);
router.put("/:id", controller.updateProduct);
router.delete("/:id", controller.deleteProduct);

export default router;
