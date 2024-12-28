import express from "express";
import LocalizationController from "../controllers/localization.js";

const router = express.Router();

router.post("/", LocalizationController.createLocalization);
router.get("/all", LocalizationController.getAllLocalizations);
router.get("/", LocalizationController.getLocalizations);
router.put("/:id", LocalizationController.updateLocalization);
router.delete("/:id", LocalizationController.deleteLocalization);
export default router;
