import express from "express";
import { uploadMultiple } from "multermate-es";
import controller from "../controllers/caseStudyTemplate1.js";
const router = express.Router();
const templateUpload = uploadMultiple({
  destination: "uploads/images",
  fields: [
    { name: "image1", maxCount: 1, fileTypes: ["images"] },
    { name: "image2", maxCount: 1, fileTypes: ["images"] },
    { name: "image3", maxCount: 1, fileTypes: ["images"] },
  ],
  fileSizeLimit: 5 * 1024 * 1024,
});
router.post("/", templateUpload, controller.createCaseStudyTemplate1);
router.get("/", controller.getCaseStudyTemplate1ByPageId);
router.get("/list", controller.getCaseStudyTemplate1List);
router.put("/:id", templateUpload, controller.updateCaseStudyTemplate1);
router.delete("/:id", controller.deleteCaseStudyTemplate1);
export default router;
