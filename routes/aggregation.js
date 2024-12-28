import express from "express";
import AggregationController from "../controllers/aggregation.js";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

router.use(verifyAccessToken);

router.post("/", AggregationController.createAggregation);
router.get("/", AggregationController.getAggregations);
router.put("/:id", AggregationController.updateAggregation);
router.delete("/:id", AggregationController.deleteAggregation);

export default router;
