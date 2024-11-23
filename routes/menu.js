import express from "express";
import MenuController from "../controllers/menu.js";

const router = express.Router();

router.post("/", MenuController.createMenu);
router.get("/", MenuController.getMenus);
router.get("/active", MenuController.getActiveMenus);
router.get("/:id", MenuController.getMenu);
router.put("/:id", MenuController.updateMenu);
router.delete("/:id", MenuController.deleteMenu);

export default router;
