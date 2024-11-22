import express from "express";
import { uploadSingle } from "multermate-es";
import {
  createmega_menus,
  creatfooter_menus,
  creatmega_menu_categories,
  deletefooter_menus,
  deletemega_menu_categories,
  deletemega_menus,
  getAllfooter_menus,
  getAllmega_menu,
  getAllmega_menu_categories,
  getfooter_menusById,
  getmega_menu_categoriesById,
  getmega_menusById,
  mega_menu_categories_frontSide,
  translations,
  translations_post,
  translations_put,
  translations_table,
  updatefooter_menus,
  updatemega_menu_categories,
  updatemega_menus,
} from "../controllers/frontend.js";

const router = express.Router();

const imageConfig = uploadSingle({
  destination: "uploads/images",
  filename: "image",
  fileTypes: ["images"],
});

router.post("/createmega_menus", createmega_menus);
router.get("/getAllmega_menu", getAllmega_menu);
router.get("/getmega_menusById/:id", getmega_menusById);
router.put("/updatemega_menus/:id", updatemega_menus);
router.delete("/deletemega_menus/:id", deletemega_menus);
// Routes for mega_menu_categories
router.get("/mega_menu_categories_frontSide", mega_menu_categories_frontSide);
router.get("/getAllmega_menu_categories", getAllmega_menu_categories);
router.post(
  "/creatmega_menu_categories",
  imageConfig,
  creatmega_menu_categories
);
router.get("/getmega_menu_categoriesById/:id", getmega_menu_categoriesById);
router.put(
  "/updatemega_menu_categories/:id",
  imageConfig,
  updatemega_menu_categories
);
router.delete("/deletemega_menu_categories/:id", deletemega_menu_categories);

// Routes for footer_menus
router.get("/getAllfooter_menus", getAllfooter_menus);
router.post("/creatfooter_menus", creatfooter_menus);
router.get("/getfooter_menusById/:id", getfooter_menusById);
router.put("/updatefooter_menus/:id", updatefooter_menus);
router.delete("/deletefooter_menus/:id", deletefooter_menus);

//----------------------------translate----------------------------------------------------
router.get("/translations", translations);
router.get("/translations_table", translations_table);
router.put("/translations_put/:id", translations_put);
router.post("/translations_post", translations_post);
export default router;
