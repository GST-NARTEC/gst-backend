import express from "express";
import CountryOfOriginSaleController from "../controllers/countryOfOriginSale.js";

const router = express.Router();

router.post("/", CountryOfOriginSaleController.createCountryOfOriginSale);
router.get("/", CountryOfOriginSaleController.getCountryOfOriginSales);
router.get("/all", CountryOfOriginSaleController.getAllCountryOfOriginSales);
router.get("/:id", CountryOfOriginSaleController.getCountryOfOriginSale);
router.put("/:id", CountryOfOriginSaleController.updateCountryOfOriginSale);
router.delete("/:id", CountryOfOriginSaleController.deleteCountryOfOriginSale);

export default router;
