import express from "express";

import SubMenuController from "../controllers/subMenu.js";
import { isAuth } from "../middlewares/isAuth.js";
const router = express.Router();

router.post("/", isAuth, SubMenuController.createSubMenu);
router.get("/", SubMenuController.getSubMenus);
router.get("/:id", SubMenuController.getSubMenu);
router.put("/:id", isAuth, SubMenuController.updateSubMenu);
router.delete("/:id", isAuth, SubMenuController.deleteSubMenu);

export default router;
