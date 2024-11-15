import express from "express";

import licenseRoutes from "./license.js";
import userRoutes from "./user.js";

const router = express.Router();

router.use("/license", licenseRoutes);
router.use("/user", userRoutes);
export default router;
