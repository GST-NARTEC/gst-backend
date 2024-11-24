import express from "express";
import { uploadSingle } from "multermate-es";

import WhyBarcodeController from "../controllers/whyBarcode.js";

const router = express.Router();

const imageConfig = uploadSingle({
  destination: "uploads/images",
  filename: "image",
  fileTypes: ["images"],
});

router.post("/", imageConfig, WhyBarcodeController.createWhyBarcode);
router.get("/", WhyBarcodeController.getWhyBarcodes);
router.get("/:id", WhyBarcodeController.getWhyBarcode);
router.put("/:id", imageConfig, WhyBarcodeController.updateWhyBarcode);
router.delete("/:id", WhyBarcodeController.deleteWhyBarcode);
router.get("/active", WhyBarcodeController.getActiveWhyBarcodes);
export default router;
