import express from "express";
import { uploadSingle } from "multermate-es";
import controller from "../controllers/category.js";

const router = express.Router();
const config = {
  filename: "image",
  fileTypes: ["images"],
  destination: "/uploads/images",
  fileSizeLimit: 5 * 1024 * 1024, // 5MB
};

router.post("/", uploadSingle(config), controller.createCategory);
router.get("/", controller.getCategories);
router.get("/:id", controller.getCategory);
router.put("/:id", uploadSingle(config), controller.updateCategory);
router.delete("/:id", controller.deleteCategory);

export default router;
