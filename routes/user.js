import express from "express";
import controller from "../controllers/user.js";

const router = express.Router();

router.post("/send-otp", controller.sendEmailOTP);
router.post("/verify-otp", controller.verifyEmailOTP);
router.post("/create", controller.createUser);

export default router;
