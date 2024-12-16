import express from "express";
import controller from "../controllers/digitalLink.js";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

router.use(verifyAccessToken);

router.post("/", controller.createDigitalLink);
router.get(
  "/:gtin/:digitalLinkType",
  controller.getDigitalLinksByGtinAndLinkType
);
router.get("/:id", controller.getDigitalLink);
router.put("/:id", controller.updateDigitalLink);
router.delete("/:id", controller.deleteDigitalLink);

export default router;
