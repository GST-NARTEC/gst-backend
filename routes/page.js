import express from "express";
import PageController from "../controllers/page.js";

const router = express.Router();

router.post("/", PageController.createPage);
router.get("/", PageController.getPages);
router.get("/template/:template", PageController.getPagesByTemplate);
router.get("/:id", PageController.getPage);
router.put("/:id", PageController.updatePage);
router.delete("/:id", PageController.deletePage);
router.get("/slug/:slug", PageController.getPageBySlug);

export default router;
