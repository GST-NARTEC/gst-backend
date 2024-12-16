import express from "express";

import SuperAdminController from "../controllers/superAdmin.js";
const router = express.Router();

router.post("/login", SuperAdminController.login);
router.post("/refresh-token", SuperAdminController.refreshToken);

export default router;
