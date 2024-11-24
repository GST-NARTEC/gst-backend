import express from "express";
import { uploadMultiple } from "multermate-es";

import SliderController from "../controllers/slider.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

const imageConfig = uploadMultiple({
  destination: "uploads/images",
  fields: [
    {
      name: "imageEn",
      maxCount: 1,
      fileTypes: ["images"],
    },
    {
      name: "imageAr",
      maxCount: 1,
      fileTypes: ["images"],
    },
  ],
  fileSizeLimit: 5 * 1024 * 1024, // 5MB per file
});

router.post("/", isAuth, imageConfig, SliderController.createSlider);
router.get("/", SliderController.getSliders);
router.get("/active", SliderController.getActiveSliders);
router.get("/:id", SliderController.getSlider);
router.put("/:id", isAuth, imageConfig, SliderController.updateSlider);
router.delete("/:id", isAuth, SliderController.deleteSlider);

export default router;
