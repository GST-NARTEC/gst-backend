import express from "express";
import { uploadSingle } from "multermate-es";
import controller from "../controllers/category.js";

const router = express.Router();
const singleConfig = uploadSingle({
  destination: "uploads/images",
  filename: "image",
  fileTypes: ["images"],
});

router.post("/", singleConfig, controller.createCategory);
router.get("/", controller.getCategories);
router.get("/count", controller.getCategoriesCount);
router.get("/:id", controller.getCategory);
router.put("/:id", singleConfig, controller.updateCategory);
router.delete("/:id", controller.deleteCategory);

export default router;
