import express from "express";
import DigitalLinkController from "../controllers/digitalLink.js";

const router = express.Router();

router.post("/", DigitalLinkController.createDigitalLink);
router.get("/:gtin", DigitalLinkController.getDigitalLinksByGtin);
router.get("/:id", DigitalLinkController.getDigitalLink);
router.put("/:id", DigitalLinkController.updateDigitalLink);
router.delete("/:id", DigitalLinkController.deleteDigitalLink);

export default router;
