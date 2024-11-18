import express from "express";
import { uploadSingle } from "multermate-es";

import controller from "../controllers/license.js";

const router = express.Router();
const singleConfig = {
  filename: "document",
  fileTypes: ["pdfs"],
  destination: "/uploads/pdfs",
};

router.post("/verify", controller.verifyLicense);
router.post("/", uploadSingle(singleConfig), controller.addLicense);
router.get("/", controller.getLicenses);
router.delete("/:id", controller.deleteLicense);

export default router;
