// routes/userGuide.js
import express from "express";
import { uploadMultiple } from "../config/multermate.js";

import UserGuideController from "../controllers/userGuide.js";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();
const controller = new UserGuideController();

const upload = uploadMultiple({
  fields: [
    {
      name: "pdf",
      maxCount: 1,
      fileSizeLimit: 500 * 1024 * 1024,
    },
    {
      name: "video",
      maxCount: 1,
      fileSizeLimit: 500 * 1024 * 1024,
    },
  ],
  destination: "uploads/user-guide",
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
});

// Add specific route configuration for large files
router.use("/upload-large", (req, res, next) => {
  // Disable default body parser for this route
  express.raw({
    limit: "500mb",
    type: "*/*",
  })(req, res, next);
});

router.post("/", verifyAccessToken, upload, controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.put("/:id", verifyAccessToken, upload, controller.update);
router.delete("/:id", verifyAccessToken, controller.delete);
router.post("/upload-large", verifyAccessToken, controller.uploadLargeFile);

export default router;
