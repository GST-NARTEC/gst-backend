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

router.use(
  fileUpload({
    limits: {
      fileSize: 500 * 1024 * 1024, // 500MB max file size
    },
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: "/tmp/",
    debug: true,
  })
);

router.post("/", verifyAccessToken, upload, controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.put("/:id", verifyAccessToken, upload, controller.update);
router.delete("/:id", verifyAccessToken, controller.delete);
router.post("/upload-large", verifyAccessToken, controller.uploadLargeFile);

export default router;
