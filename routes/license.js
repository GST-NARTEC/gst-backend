import express from "express";

import controller from "../controllers/license.js";

const router = express.Router();

router.post("/verify", controller.verifyLicense);

export default router;
