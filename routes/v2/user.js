import express from "express";
import UserController from "../../controllers/user.js";

const router = express.Router();

router.post("/create-with-checkout", UserController.createWithCartAndCheckout);

export default router;
