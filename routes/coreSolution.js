import express from "express";
import { uploadSingle } from "multermate-es";

import controller from "../controllers/coreSolution.js";

const router = express.Router();

const imageConfig = uploadSingle({
  destination: "uploads/images",
  filename: "image",
  fileTypes: ["images"],
});

router.post("/", imageConfig, controller.createCoreSolution);
router.get("/", controller.getCoreSolutions);
router.get("/:id", controller.getCoreSolution);
router.put("/:id", imageConfig, controller.updateCoreSolution);
router.delete("/:id", controller.deleteCoreSolution);

export default router;
