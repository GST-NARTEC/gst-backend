import express from "express";
import { uploadSingle } from "multermate-es";
import controller from "../controllers/product.js";
import { verifyApiKey } from "../middlewares/auth.js";

const router = express.Router();
const singleConfig = uploadSingle({
  destination: "uploads/images",
  filename: "image",
  fileTypes: ["images"],
});

router.get("/active", controller.getActiveProducts);
router.get("/count", controller.getProductsCount);
router.get("/user/:userId", verifyApiKey, controller.getProductsByUserId);
router.post("/", singleConfig, controller.createProduct);
router.get("/", controller.getProducts);
router.get("/:id", controller.getProduct);
router.put("/:id", singleConfig, controller.updateProduct);
router.delete("/:id", controller.deleteProduct);

export default router;
