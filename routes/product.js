import express from "express";
import controller from "../controllers/product.js";
import upload from "../utils/multerConfig.js";

const router = express.Router();

router.post("/", upload.single("image"), controller.createProduct);
router.get("/", controller.getProducts);
router.get("/:id", controller.getProduct);
router.put("/:id", upload.single("image"), controller.updateProduct);
router.delete("/:id", controller.deleteProduct);

export default router;
