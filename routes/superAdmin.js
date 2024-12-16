import express from "express";

import SuperAdminController from "../controllers/superAdmin.js";
import { verifyRefreshToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", SuperAdminController.login);
router.post(
  "/refresh-token",
  verifyRefreshToken,
  SuperAdminController.refreshToken
);

export default router;
