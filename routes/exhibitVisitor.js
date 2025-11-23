import express from "express";
import controller from "../controllers/exhibitVisitor.js";

const router = express.Router();

// Create a new exhibit visitor
router.post("/", controller.createExhibitVisitor);

// Get all exhibit visitors (with pagination and search)
router.get("/", controller.getExhibitVisitors);

// Get count of exhibit visitors
router.get("/count", controller.getExhibitVisitorsCount);

// Get a single exhibit visitor by ID
router.get("/:id", controller.getExhibitVisitor);

// Update an exhibit visitor
router.put("/:id", controller.updateExhibitVisitor);

// Delete an exhibit visitor
router.delete("/:id", controller.deleteExhibitVisitor);

export default router;
