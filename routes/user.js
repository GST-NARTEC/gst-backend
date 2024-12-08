import express from "express";
import controller from "../controllers/user.js";
import { verifyAccessToken, verifyRefreshToken } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.post("/send-otp", controller.sendEmailOTP);
router.post("/verify-otp", controller.verifyEmailOTP);
router.post("/create", controller.createUser);
router.post("/login", controller.login);
router.get("/search", controller.searchUsers);
router.get("/:id", controller.getUserDetails);
router.get("/member/:id", verifyAccessToken, controller.getUserDetails);
router.put("/:id", controller.updateUser);
router.delete("/:id", controller.deleteUser);
router.post("/refresh-token", verifyRefreshToken, controller.refreshToken);
router.patch("/:id/status", controller.updateUserStatus);

export default router;
