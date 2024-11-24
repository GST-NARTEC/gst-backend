import express from "express";
import { uploadSingle } from "multermate-es";

import controller from "../controllers/coreSolution.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

const imageConfig = uploadSingle({
  destination: "uploads/images",
  filename: "image",
  fileTypes: ["images"],
});

router.post("/", isAuth, imageConfig, controller.createCoreSolution);
router.get("/", controller.getCoreSolutions);
router.get("/:id", controller.getCoreSolution);
router.put("/:id", isAuth, imageConfig, controller.updateCoreSolution);
router.delete("/:id", isAuth, controller.deleteCoreSolution);

export default router;
