import express from "express";
import { uploadSingle } from "multermate-es";

import MenuController from "../controllers/menu.js";

const router = express.Router();

const imageConfig = uploadSingle({
  destination: "uploads/images",
  filename: "image",
  fileTypes: ["images"],
});

router.post("/", imageConfig, MenuController.createMenu);
router.get("/", MenuController.getMenus);
router.get("/active", MenuController.getActiveMenus);
router.get("/:id", MenuController.getMenu);
router.put("/:id", imageConfig, MenuController.updateMenu);
router.delete("/:id", MenuController.deleteMenu);

export default router;
