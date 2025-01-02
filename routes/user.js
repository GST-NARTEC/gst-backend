import express from "express";
import controller from "../controllers/user.js";
import { verifyAccessToken, verifyRefreshToken } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.post("/send-otp", controller.sendEmailOTP);
router.post("/verify-otp", controller.verifyEmailOTP);
router.post("/login", controller.login);
router.post("/create-order", controller.createNewOrder);
router.get(
  "/total-sec-quantity",
  verifyAccessToken,
  controller.getTotalSecQuantity
);
router.get("/search", controller.searchUsers);
router.get("/:id", controller.getUserDetails);
router.get("/member/:id", verifyAccessToken, controller.getUserDetails);
router.put("/:id", controller.updateUser);
router.delete("/:id", controller.deleteUser);
router.post("/refresh-token", verifyRefreshToken, controller.refreshToken);
router.patch("/:id/status", controller.updateUserStatus);
router.get("/:id/gtins", verifyAccessToken, controller.getUserGtins);
router.post("/initiate-password-reset", controller.initiatePasswordReset);
router.post("/verify-reset-password-otp", controller.verifyResetPasswordOTP);
router.post("/reset-password", controller.resetPassword);

export default router;
