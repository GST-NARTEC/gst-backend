import express from "express";

import { uploadSingle } from "multermate-es";
import controller from "../controllers/product.js";

const router = express.Router();
const config = {
  filename: "image",
  fileTypes: ["images"],
  fileSizeLimit: 5 * 1024 * 1024,
  destination: "uploads/images",
};

router.post("/", uploadSingle(config), controller.createProduct);
router.get("/", controller.getProducts);
router.get("/:id", controller.getProduct);
router.put("/:id", uploadSingle(config), controller.updateProduct);
router.delete("/:id", controller.deleteProduct);

export default router;
