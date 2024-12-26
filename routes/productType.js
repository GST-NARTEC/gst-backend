import express from "express";
import ProductTypeController from "../controllers/productType.js";

const router = express.Router();

router.post("/", ProductTypeController.createProductType);
router.get("/", ProductTypeController.getProductTypes);
router.get("/all", ProductTypeController.getAllProductTypes);
router.get("/:id", ProductTypeController.getProductType);
router.put("/:id", ProductTypeController.updateProductType);
router.delete("/:id", ProductTypeController.deleteProductType);

export default router;
