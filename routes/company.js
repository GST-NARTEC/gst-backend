import express from "express";
import { uploadSingle } from "multermate-es";
import controller from "../controllers/company.js";

const router = express.Router();

const iconUpload = uploadSingle({
  destination: "uploads/images",
  filename: "icon",
  fileTypes: ["images"],
});

router.post("/", iconUpload, controller.createCompany);
router.get("/", controller.getCompanies);
router.get("/:id", controller.getCompany);
router.put("/:id", iconUpload, controller.updateCompany);
router.delete("/:id", controller.deleteCompany);

export default router;
