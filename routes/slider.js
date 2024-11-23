import express from "express";
import { uploadMultiple } from "multermate-es";
import SliderController from "../controllers/slider.js";

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

router.post("/", imageConfig, SliderController.createSlider);
router.get("/", SliderController.getSliders);
router.get("/active", SliderController.getActiveSliders);
router.get("/:id", SliderController.getSlider);
router.put("/:id", imageConfig, SliderController.updateSlider);
router.delete("/:id", SliderController.deleteSlider);

export default router;
