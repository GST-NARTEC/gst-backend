import express from "express";
import { uploadSingle } from "multermate-es";
import GTINController from "../controllers/gtin.js";
import { cacheMiddleware, clearCache } from "../middlewares/cache.js";

const router = express.Router();
const uploadFile = uploadSingle({
  destination: "uploads/barcodes",
  filename: "file",
});

// router.use(verifyAccessToken);

// Add cache clearing for modification routes
router.post(
  "/upload",
  uploadFile,
  clearCache("gtin:*"),
  GTINController.uploadGTINFile
);
router.post("/bulk", clearCache("gtin:*"), GTINController.addGTINList);

// Add caching for GET routes
router.get("/", cacheMiddleware("gtin"), GTINController.getGTINs);
router.get("/stats", cacheMiddleware("gtin"), GTINController.getGTINStats);

export default router;
