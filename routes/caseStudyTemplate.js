// import express from "express";
// import { uploadMultiple } from "multermate-es";
// import controller from "../controllers/caseStudyTemplate.js";

// const router = express.Router();

// const templateUpload = uploadMultiple({
//   destination: "uploads/images",
//   fields: [
//     { name: "image1", maxCount: 1, fileTypes: ["images"] },
//     { name: "image2", maxCount: 1, fileTypes: ["images"] },
//     { name: "image3", maxCount: 1, fileTypes: ["images"] },
//   ],
//   fileSizeLimit: 5 * 1024 * 1024, // 5MB per file
// });

// router.post(
//   "/:templateType",
//   templateUpload,
//   controller.createCaseStudyTemplate
// );
// router.get("/:templateType", controller.getCaseStudyTemplateByPageId);
// router.get("/:templateType/list", controller.getCaseStudyTemplatesByType);
// router.get("/:templateType/slug", controller.getCaseStudyTemplateBySlug);
// router.put(
//   "/:templateType/:id",
//   templateUpload,
//   controller.updateCaseStudyTemplate
// );
// router.delete("/:templateType/:id", controller.deleteCaseStudyTemplate);

// export default router;
