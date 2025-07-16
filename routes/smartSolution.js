import express from "express";
import { uploadSingle } from "multermate-es";

import controller from "../controllers/smartSolution.js";

const router = express.Router();

const imageConfig = uploadSingle({
  destination: "uploads/images",
  filename: "image",
  fileTypes: ["images"],
});

router.get("/active", controller.getActiveSmartSolutions);
router.post("/", imageConfig, controller.createSmartSolution);
router.get("/", controller.getSmartSolutions);
router.get("/:id", controller.getSmartSolution);
router.put("/:id", imageConfig, controller.updateSmartSolution);
router.delete("/:id", controller.deleteSmartSolution);

export default router;
