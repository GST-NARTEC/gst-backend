import express from "express";
import { uploadSingle } from "multermate-es";

import BrandController from "../controllers/brand.js";

const router = express.Router();

const documentConfig = uploadSingle({
  destination: "uploads/docs",
  filename: "document",
});

router.post("/", documentConfig, BrandController.createBrand);
router.get("/", BrandController.getBrands);
router.get("/active", BrandController.getActiveBrands);
router.get("/:id", BrandController.getBrand);
router.put("/:id", documentConfig, BrandController.updateBrand);
router.delete("/:id", BrandController.deleteBrand);

export default router;
