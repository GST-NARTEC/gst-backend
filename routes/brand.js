import express from "express";
import { uploadSingle } from "multermate-es";
import { verifyAccessToken } from "../middlewares/auth.js";

import BrandController from "../controllers/brand.js";

const router = express.Router();

const documentConfig = uploadSingle({
  destination: "uploads/docs",
  filename: "document",
});

router.get("/getUserBrands/:id", BrandController.getUserBrands);

// Protected routes
router.use(verifyAccessToken);
router.post("/", documentConfig, BrandController.createBrand);
router.get("/", BrandController.getMyBrands);
router.get("/active", BrandController.getActiveBrands);
router.get("/:id", BrandController.getBrand);
router.put("/:id", documentConfig, BrandController.updateBrand);
router.delete("/:id", BrandController.deleteBrand);

export default router;
