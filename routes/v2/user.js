import express from "express";
import UserController from "../../controllers/user.js";

const router = express.Router();

router.post("/create", UserController.createWithCart);

export default router;
