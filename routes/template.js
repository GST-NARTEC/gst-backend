import express from "express";
import { uploadMultiple } from "multermate-es";
import controller from "../controllers/template.js";

const router = express.Router();

const templateUpload = uploadMultiple({
  destination: "uploads/images",
  fields: [
    { name: "image1", maxCount: 1, fileTypes: ["images"] },
    { name: "image2", maxCount: 1, fileTypes: ["images"] },
    { name: "image3", maxCount: 1, fileTypes: ["images"] },
    { name: "image4", maxCount: 1, fileTypes: ["images"] },
    { name: "image5", maxCount: 1, fileTypes: ["images"] },
    { name: "image6", maxCount: 1, fileTypes: ["images"] },
    { name: "image7", maxCount: 1, fileTypes: ["images"] },
    { name: "image8", maxCount: 1, fileTypes: ["images"] },
    { name: "image9", maxCount: 1, fileTypes: ["images"] },
    { name: "image10", maxCount: 1, fileTypes: ["images"] },
  ],
  fileSizeLimit: 5 * 1024 * 1024, // 5MB per file
});

router.post("/:templateType", templateUpload, controller.createTemplate);
router.get("/:templateType", controller.getTemplateByPageId);
router.get("/:templateType/list", controller.getTemplatesByType);
router.put("/:templateType/:id", templateUpload, controller.updateTemplate);
router.delete("/:templateType/:id", controller.deleteTemplate);
router.get("/:templateType/slug", controller.getTemplateBySlug);

export default router;
