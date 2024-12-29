import express from "express";
import UDIController from "../controllers/udi.js";
const router = express.Router();

// router.use(verifyAccessToken);

router.post("/", UDIController.createUDI);
router.get("/", UDIController.getUDIs);
router.put("/:id", UDIController.updateUDI);
router.delete("/:id", UDIController.deleteUDI);

export default router;
