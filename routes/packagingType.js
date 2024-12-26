import express from "express";
import PackagingTypeController from "../controllers/packagingType.js";

const router = express.Router();

router.post("/", PackagingTypeController.createPackagingType);
router.get("/", PackagingTypeController.getPackagingTypes);
router.get("/all", PackagingTypeController.getAllPackagingTypes);
router.get("/:id", PackagingTypeController.getPackagingType);
router.put("/:id", PackagingTypeController.updatePackagingType);
router.delete("/:id", PackagingTypeController.deletePackagingType);

export default router;
