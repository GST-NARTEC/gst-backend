import express from "express";
import { uploadSingle } from "multermate-es";

import controller from "../controllers/license.js";

const router = express.Router();
const singleConfig = uploadSingle({
  destination: "uploads/documents",
  filename: "document",
  fileTypes: ["pdfs"],
});

router.post("/verify", controller.verifyLicense);
router.post("/", singleConfig, controller.addLicense);
router.get("/", controller.getLicenses);
router.delete("/:id", controller.deleteLicense);

export default router;
