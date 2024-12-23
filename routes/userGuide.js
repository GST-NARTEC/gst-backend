// routes/userGuide.js
import express from "express";
import { uploadMultiple } from "multermate-es";
import UserGuideController from "../controllers/userGuide.js";

const router = express.Router();
const userGuideController = new UserGuideController();

const upload = uploadMultiple({
  fields: [
    {
      name: "pdf",
      maxCount: 1,
    },
    {
      name: "video",
      maxCount: 5,
    },
  ],
  destination: "uploads/user-guide",
});

// router.use(verifyAccessToken);

router.post("/", upload, userGuideController.create);
router.get("/", userGuideController.getAll);
router.get("/:id", userGuideController.getOne);
router.put("/:id", upload, userGuideController.update);
router.delete("/:id", userGuideController.delete);

export default router;
