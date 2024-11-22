import express from "express";
import controller from "../controllers/user.js";

const router = express.Router();

// Public routes
router.post("/send-otp", controller.sendEmailOTP);
router.post("/verify-otp", controller.verifyEmailOTP);
router.post("/create", controller.createUser);
router.post("/login", controller.login);
router.get("/search", controller.searchUsers);
router.get("/:id", controller.getUserDetails);
router.put("/:id", controller.updateUser);
router.delete("/:id", controller.deleteUser);

export default router;
