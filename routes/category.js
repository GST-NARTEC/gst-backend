import express from "express";
import controller from "../controllers/category.js";
import upload from "../utils/multerConfig.js";

const router = express.Router();

router.post("/", upload.single("image"), controller.createCategory);
router.get("/", controller.getCategories);
router.get("/:id", controller.getCategory);
router.put("/:id", upload.single("image"), controller.updateCategory);
router.delete("/:id", controller.deleteCategory);

export default router;
