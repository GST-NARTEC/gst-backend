import express from "express";
import { uploadSingle } from "multermate-es";
import GTINController from "../controllers/gtin.js";

const router = express.Router();
const uploadFile = uploadSingle({
  destination: "uploads/barcodes",
  filename: "file",
});

// router.use(verifyAccessToken);

router.post("/upload", uploadFile, GTINController.uploadGTINFile);
router.post("/bulk", GTINController.addGTINList);
router.post("/sell", GTINController.sellGtins);
router.get("/", GTINController.getGTINs);
router.get("/stats", GTINController.getGTINStats);

export default router;
