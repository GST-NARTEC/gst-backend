import express from "express";
import {getAllmega_menu,createmega_menus,getmega_menusById,updatemega_menus,deletemega_menus} from "../controllers/frontendController.js";
import upload from "../utils/multerConfig.js";

const router = express.Router();

router.post("/createmega_menus", createmega_menus);
router.get("/getAllmega_menu", getAllmega_menu);
router.get("/getmega_menusById/:id", getmega_menusById);
router.put("/updatemega_menus/:id", updatemega_menus);
router.delete("/deletemega_menus/:id", deletemega_menus);

export default router;