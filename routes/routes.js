import express from "express";

import addonRoutes from "./addon.js";
import brandRoutes from "./brand.js";
import cartRoutes from "./cart.js";
import categoryRoutes from "./category.js";
import checkoutRoutes from "./checkout.js";
import coreSolutionRoutes from "./coreSolution.js";
import currencyRoutes from "./currency.js";
import frontend from "./frontend.js";
import licenseRoutes from "./license.js";
import locationRoutes from "./location.js";
import menuRoutes from "./menu.js";
import orderRoutes from "./order.js";
import pageRoutes from "./page.js";
import productRouter from "./product.js";
import proServiceRoutes from "./proService.js";
import sliderRoutes from "./slider.js";
import subMenuRoutes from "./subMenu.js";
import templateRoutes from "./template.js";
import userRoutes from "./user.js";
import userDocRoutes from "./userDoc.js";
import userProductRoutes from "./userProducts.js";
import cartRoutesV2 from "./v2/cart.js";
import userRoutesV2 from "./v2/user.js";
import vatRoutes from "./vat.js";
import whyBarcodeRoutes from "./whyBarcode.js";
import unitCodeRoutes from "./unitCode.js";
const router = express.Router();

// V1 Routes
router.use("/license/v1", licenseRoutes);
router.use("/user/v1", userRoutes);
router.use("/products/v1", productRouter);
router.use("/cart/v1", cartRoutes);
router.use("/checkout/v1", checkoutRoutes);
router.use("/locations/v1", locationRoutes);
router.use("/currency/v1", currencyRoutes);
router.use("/vat/v1", vatRoutes);
router.use("/category/v1", categoryRoutes);
router.use("/masterdata/v1", frontend);
router.use("/menu/v1", menuRoutes);
router.use("/submenu/v1", subMenuRoutes);
router.use("/slider/v1", sliderRoutes);
router.use("/core-solution/v1", coreSolutionRoutes);
router.use("/pro-service/v1", proServiceRoutes);
router.use("/v1/whybarcode", whyBarcodeRoutes);
router.use("/page/v1", pageRoutes);
router.use("/v1/template", templateRoutes);
router.use("/v1/orders", orderRoutes);
router.use("/v1/addons", addonRoutes);
router.use("/v1/brands", brandRoutes);
router.use("/v1/user-products", userProductRoutes);
router.use("/v1/user-docs", userDocRoutes);
router.use("/unit-codes", unitCodeRoutes);

// V2 Routes
router.use("/cart/v2", cartRoutesV2);
router.use("/user/v2", userRoutesV2);

export default router;
