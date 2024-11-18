import express from "express";
import controller from "../controllers/vat.js";

const router = express.Router();

router.post("/", controller.createVat);
router.get("/", controller.getVats);
router.get("/:id", controller.getVat);
router.put("/:id", controller.updateVat);
router.delete("/:id", controller.deleteVat);

export default router;
