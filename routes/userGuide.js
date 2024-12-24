// routes/userGuide.js
import express from "express";
import { uploadSingle } from "multermate-es";
import UserGuideController from "../controllers/userGuide.js";

const router = express.Router();
const userGuideController = new UserGuideController();

const upload = uploadSingle({
  filename: "link",
  destination: "uploads/user-guide",
});

// router.use(verifyAccessToken);

router.post("/", upload, userGuideController.create);
router.get("/", userGuideController.getAll);
router.get("/:id", userGuideController.getOne);
router.put("/:id", upload, userGuideController.update);
router.delete("/:id", userGuideController.delete);

export default router;
