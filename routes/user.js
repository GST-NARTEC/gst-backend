import express from "express";
import controller from "../controllers/user.js";

const router = express.Router();

// Public routes
router.post("/send-otp", controller.sendEmailOTP);
router.post("/verify-otp", controller.verifyEmailOTP);
router.post("/create", controller.createUser);
router.post("/login", controller.login);
router.get("/search", controller.searchUsers);

export default router;
