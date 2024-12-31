import express from "express";
import DashboardController from "../controllers/dashboard.js";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/stats", verifyAccessToken, DashboardController.getDashboardStats);

export default router;
