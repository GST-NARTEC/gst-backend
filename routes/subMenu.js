import express from "express";

import SubMenuController from "../controllers/subMenu.js";
const router = express.Router();

router.post("/", SubMenuController.createSubMenu);
router.get("/", SubMenuController.getSubMenus);
router.get("/:id", SubMenuController.getSubMenu);
router.put("/:id", SubMenuController.updateSubMenu);
router.delete("/:id", SubMenuController.deleteSubMenu);

export default router;
