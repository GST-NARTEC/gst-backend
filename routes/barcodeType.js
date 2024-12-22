import express from "express";
import BarcodeTypeController from "../controllers/barcodeType.js";

const router = express.Router();

router.post("/", BarcodeTypeController.createBarcodeType);
router.get("/", BarcodeTypeController.getBarcodeTypes);
router.get("/:id", BarcodeTypeController.getBarcodeType);
router.put("/:id", BarcodeTypeController.updateBarcodeType);
router.delete("/:id", BarcodeTypeController.deleteBarcodeType);

export default router;
