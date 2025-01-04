// routes/userGuide.js
import express from "express";
import fileUpload from "express-fileupload";
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
      fileSizeLimit: 800 * 1024 * 1024,
    },
    {
      name: "video",
      maxCount: 1,
      fileSizeLimit: 800 * 1024 * 1024,
    },
  ],
  destination: "uploads/user-guide",
  limits: {
    fileSize: 800 * 1024 * 1024, // 800MB
  },
});

router.post("/", verifyAccessToken, upload, controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.put("/:id", verifyAccessToken, upload, controller.update);
router.delete("/:id", verifyAccessToken, controller.delete);
router.post(
  "/upload-large",
  verifyAccessToken,
  fileUpload({
    limits: {
      fileSize: 800 * 1024 * 1024, // 800MB max file size
    },
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: "/tmp/",
    debug: true,
  }),
  controller.uploadLargeFile
);

export default router;
