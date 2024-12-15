import express from "express";
import controller from "../controllers/docType.js";

const router = express.Router();

router.get("/", controller.getDocTypes);

export default router;
