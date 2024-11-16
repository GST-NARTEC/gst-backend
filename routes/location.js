import express from "express";
import LocationController from "../controllers/location.js";

const router = express.Router();

router.get("/countries", LocationController.getCountries);

router.get("/regions", LocationController.getRegions);

router.get("/cities", LocationController.getCities);

export default router;
