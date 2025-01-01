import express from "express";
import { uploadSingle } from "multermate-es";
import controller from "../controllers/gln.js";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

// Configure image upload
const imageConfig = uploadSingle({
  destination: "uploads/images",
  filename: "image",
  fileTypes: ["images"],
});

// All routes should be protected
router.use(verifyAccessToken);

// CRUD operations
router.post("/", imageConfig, controller.createGLN);
router.get("/", controller.listProducts);
router.get("/:id", controller.getProduct);
router.put("/:id", imageConfig, controller.updateProduct);
router.delete("/:id", controller.deleteProduct);

// Export operations
router.get("/export/excel", controller.exportExcelGLNs);
router.get("/export/pdf", controller.exportPdfGLNs);

// Search operation
router.get("/search/gtin", controller.searchProducts);

export default router;
