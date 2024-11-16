import express from "express";

import cartRoutes from "./cart.js";
import checkoutRoutes from "./checkout.js";
import licenseRoutes from "./license.js";
import locationRoutes from "./location.js";
import productRouter from "./product.js";
import userRoutes from "./user.js";

const router = express.Router();

router.use("/license/v1", licenseRoutes);
router.use("/user/v1", userRoutes);
router.use("/products/v1", productRouter);
router.use("/cart/v1", cartRoutes);
router.use("/checkout/v1", checkoutRoutes);
router.use("/locations/", locationRoutes);

export default router;
