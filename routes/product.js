import express from "express";
import { uploadSingle } from "multermate-es";
import controller from "../controllers/product.js";

const router = express.Router();
const singleConfig = uploadSingle({
  destination: "uploads/images",
  filename: "image",
  fileTypes: ["images"],
});

router.get("/active", controller.getActiveProducts);
router.post("/", singleConfig, controller.createProduct);
router.get("/", controller.getProducts);
router.get("/:id", controller.getProduct);
router.put("/:id", singleConfig, controller.updateProduct);
router.delete("/:id", controller.deleteProduct);

export default router;
