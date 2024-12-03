import express from "express";
import AddonController from "../controllers/addon.js";

const router = express.Router();

router.post("/", AddonController.createAddon);
router.get("/", AddonController.getAddons);
router.get("/active", AddonController.getActiveAddons);

export default router;
