import express from "express";
import { uploadSingle } from "multermate-es";

import WhyBarcodeController from "../controllers/whyBarcode.js";

const router = express.Router();

const imageConfig = uploadSingle({
  destination: "uploads/images",
  filename: "image",
  fileTypes: ["images"],
});

// sometime get router making conflict with other routes so give priority to get routes
router.get("/active", WhyBarcodeController.getActiveWhyBarcodes);
router.get("/", WhyBarcodeController.getWhyBarcodes);
router.get("/:id", WhyBarcodeController.getWhyBarcode);
router.post("/", imageConfig, WhyBarcodeController.createWhyBarcode);
router.put("/:id", imageConfig, WhyBarcodeController.updateWhyBarcode);
router.delete("/:id", WhyBarcodeController.deleteWhyBarcode);
export default router;
