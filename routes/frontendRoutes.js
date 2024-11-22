import express from "express";
import {getAllmega_menu,
    createmega_menus,
    getmega_menusById,
    updatemega_menus,
    deletemega_menus,
    getAllmega_menu_categories,
    creatmega_menu_categories,
    getmega_menu_categoriesById,
    updatemega_menu_categories,
    deletemega_menu_categories,
    getAllfooter_menus,
    creatfooter_menus,
    getfooter_menusById,
    updatefooter_menus,
    deletefooter_menus,
    mega_menu_categories_frontSide,
    translations,translations_table,translations_put,translations_post,} from "../controllers/frontendController.js";
import upload from "../utils/multerConfig.js";

const router = express.Router();

router.post("/createmega_menus", createmega_menus);
router.get("/getAllmega_menu", getAllmega_menu);
router.get("/getmega_menusById/:id", getmega_menusById);
router.put("/updatemega_menus/:id", updatemega_menus);
router.delete("/deletemega_menus/:id", deletemega_menus);
// Routes for mega_menu_categories
router.get("/mega_menu_categories_frontSide", mega_menu_categories_frontSide);
router.get("/getAllmega_menu_categories", getAllmega_menu_categories);
router.post("/creatmega_menu_categories",upload.single("image"), creatmega_menu_categories);
router.get("/getmega_menu_categoriesById/:id", getmega_menu_categoriesById);
router.put("/updatemega_menu_categories/:id",upload.single("image"),updatemega_menu_categories);
router.delete("/deletemega_menu_categories/:id",deletemega_menu_categories);

// Routes for footer_menus
router.get("/getAllfooter_menus", getAllfooter_menus);
router.post("/creatfooter_menus", creatfooter_menus);
router.get("/getfooter_menusById/:id", getfooter_menusById);
router.put("/updatefooter_menus/:id",updatefooter_menus);
router.delete("/deletefooter_menus/:id", deletefooter_menus);

//----------------------------translate----------------------------------------------------
router.get('/translations', translations)
router.get("/translations_table",translations_table)
router.put("/translations_put/:id", translations_put)
router.post("/translations_post", translations_post)
export default router;