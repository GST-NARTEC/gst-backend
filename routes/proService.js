import express from "express";
import { uploadSingle } from "multermate-es";
import ProServiceController from "../controllers/proService.js";

const router = express.Router();

const imageConfig = uploadSingle({
  destination: "uploads/images",
  filename: "image",
  fileTypes: ["images"],
});

router.post("/", imageConfig, ProServiceController.createProService);
router.get("/", ProServiceController.getProServices);
router.get("/active", ProServiceController.getActiveProServices);
router.get("/:id", ProServiceController.getProService);
router.put("/:id", imageConfig, ProServiceController.updateProService);
router.delete("/:id", ProServiceController.deleteProService);

export default router;
