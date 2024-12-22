import express from "express";
import Controller from "../controllers/barcodeType.js";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", Controller.createBarcodeType);
router.get("/", Controller.getBarcodeTypes);
router.get("/counts", verifyAccessToken, Controller.getBarcodeTypesWithCounts);
router.get("/:id", Controller.getBarcodeType);
router.put("/:id", Controller.updateBarcodeType);
router.delete("/:id", Controller.deleteBarcodeType);
export default router;
