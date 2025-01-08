import express from "express";
import { runModel } from "../controllers/AI.js";

const router = express.Router();

router.post("/generate", runModel);

export default router;