import express from "express";
import KPIController from "../controllers/kpi.js";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

// All KPI routes require authentication (superadmin or user with access)
// Overview statistics
router.get("/overview", verifyAccessToken, KPIController.getOverview);

// Revenue trends for charts
router.get("/revenue-trends", verifyAccessToken, KPIController.getRevenueTrends);

// Members list with order statistics
router.get("/members", verifyAccessToken, KPIController.getMembers);

// Quick stats for dashboard cards
router.get("/quick-stats", verifyAccessToken, KPIController.getQuickStats);

// Top products
router.get("/top-products", verifyAccessToken, KPIController.getTopProducts);

// Export data
router.get("/export", verifyAccessToken, KPIController.exportData);

export default router;
