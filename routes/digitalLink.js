import express from "express";
import controller from "../controllers/digitalLink.js";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verifyAccessToken, controller.createDigitalLink);
router.get("/:gtin", controller.getDigitalLinksByGtin);
router.get("/:id", controller.getDigitalLink);
router.put("/:id", verifyAccessToken, controller.updateDigitalLink);
router.delete("/:id", verifyAccessToken, controller.deleteDigitalLink);

export default router;
