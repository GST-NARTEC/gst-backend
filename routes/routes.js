import express from "express";

import cartRoutes from "./cart.js";
import categoryRoutes from "./category.js";
import checkoutRoutes from "./checkout.js";
import currencyRoutes from "./currency.js";
import licenseRoutes from "./license.js";
import locationRoutes from "./location.js";
import productRouter from "./product.js";
import userRoutes from "./user.js";
import vatRoutes from "./vat.js";

const router = express.Router();

router.use("/license/v1", licenseRoutes);
router.use("/user/v1", userRoutes);
router.use("/products/v1", productRouter);
router.use("/cart/v1", cartRoutes);
router.use("/checkout/v1", checkoutRoutes);
router.use("/locations/v1", locationRoutes);
router.use("/currency/v1", currencyRoutes);
router.use("/vat/v1", vatRoutes);
router.use("/category/v1", categoryRoutes);

export default router;
