import express from "express";
import { uploadSingle } from "multermate-es";
import { verifyAccessToken } from "../middlewares/auth.js";
import { cacheMiddleware, clearCache } from "../middlewares/cache.js";

import BrandController from "../controllers/brand.js";

const router = express.Router();

const documentConfig = uploadSingle({
  destination: "uploads/docs",
  filename: "document",
});

router.get("/getUserBrands/:id", BrandController.getUserBrands);

// Protected routes
router.use(verifyAccessToken);
router.post(
  "/",
  clearCache("brands:*"),
  documentConfig,
  BrandController.createBrand
);
router.get("/", cacheMiddleware("brands"), BrandController.getMyBrands);
router.get("/active", BrandController.getActiveBrands);
router.get("/:id", cacheMiddleware("brands"), BrandController.getBrand);
router.put(
  "/:id",
  clearCache("brands:*"),
  documentConfig,
  BrandController.updateBrand
);
router.delete("/:id", clearCache("brands:*"), BrandController.deleteBrand);

export default router;
