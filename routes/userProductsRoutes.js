import express from "express";
import { uploadMultiple } from "multermate-es";
import UserProductsController from "../controllers/userProductsController.js";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

const productUpload = uploadMultiple({
  destination: "uploads/userProducts",
  fields: [
    { name: "images", maxCount: 5, fileTypes: ["images"] }, // Allow up to 5 images
  ],
  fileSizeLimit: 5 * 1024 * 1024, // 5MB per file
});

router.use(verifyAccessToken);

router.post("/", productUpload, UserProductsController.createProduct);
router.get("/", UserProductsController.listProducts);
router.get("/:id", UserProductsController.getProduct);
router.put("/:id", productUpload, UserProductsController.updateProduct);
router.delete("/:id", UserProductsController.deleteProduct);

export default router;
