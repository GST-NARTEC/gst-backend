import express from "express";
import { uploadSingle } from "multermate-es";
import FileController from "../controllers/file.js";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

// Configure file upload for documents (PDF and Word)
const documentUpload = uploadSingle({
  destination: "uploads/documents",
  filename: "document",
  fileTypes: ["pdfs", "documents"],
});

// Routes
// GET all files (with pagination and filtering)
router.get("/", verifyAccessToken, FileController.getFiles);

// GET single file by ID
router.get("/:id", verifyAccessToken, FileController.getFileById);

// POST upload new file
router.post("/", verifyAccessToken, documentUpload, FileController.uploadFile);

// PUT update file (name, status, or replace file)
router.put("/:id", verifyAccessToken, documentUpload, FileController.updateFile);

// PATCH toggle file active status
router.patch("/:id/toggle-status", verifyAccessToken, FileController.toggleStatus);

// DELETE file
router.delete("/:id", verifyAccessToken, FileController.deleteFile);

export default router;
