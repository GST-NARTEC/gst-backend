import express from "express";
import controller from "../controllers/currency.js";

const router = express.Router();

router.post("/", controller.createCurrency);
router.get("/", controller.getCurrencies);
router.get("/:id", controller.getCurrency);
router.put("/:id", controller.updateCurrency);
router.delete("/:id", controller.deleteCurrency);

export default router;
