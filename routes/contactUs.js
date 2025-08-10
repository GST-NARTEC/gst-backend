import express from "express";
import ContactUsController from "../controllers/contactUs.js";

const router = express.Router();

// Create a new contact inquiry
router.post("/", ContactUsController.createContactUs);

// Get all inquiries (with pagination and optional search)
router.get("/", ContactUsController.getContactUsList);

// Get a single inquiry by id
router.get("/:id", ContactUsController.getContactUsById);

// Delete an inquiry by id
router.delete("/:id", ContactUsController.deleteContactUs);

export default router;
