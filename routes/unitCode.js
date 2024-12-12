import express from "express";
import UnitCodeController from "../controllers/unitCode.js";

const router = express.Router();

router.post("/", UnitCodeController.createUnitCode);
router.get("/", UnitCodeController.getUnitCodes);
router.get("/all", UnitCodeController.getAllUnitCodes);
router.get("/:id", UnitCodeController.getUnitCode);
router.put("/:id", UnitCodeController.updateUnitCode);
router.delete("/:id", UnitCodeController.deleteUnitCode);

export default router;
