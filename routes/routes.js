import express from "express";

import licenseRoutes from "./license.js";
import productRouter from "./product.js";
import userRoutes from "./user.js";

const router = express.Router();

router.use("/license", licenseRoutes);
router.use("/user", userRoutes);
router.use("/products", productRouter);

export default router;
