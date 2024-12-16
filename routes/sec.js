// routes/sec.js
import express from "express";
import SECController from "../controllers/sec.js";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

// Protect all routes
router.use(verifyAccessToken);

router.get("/", SECController.getSECs);
router.get("/:gtin", SECController.getSecByGtin);
router.post("/", SECController.createSEC);
router.get("/:id", SECController.getSEC);
router.put("/:id", SECController.updateSEC);
router.delete("/:id", SECController.deleteSEC);

export default router;
