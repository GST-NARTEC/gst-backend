import express from "express";
import HelpTicketController from "../controllers/helpTicket.js";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

// Protect all routes
router.use(verifyAccessToken);

router.post("/", HelpTicketController.createTicket);
router.get("/", HelpTicketController.getTickets);
router.get("/:id", HelpTicketController.getTicket);
router.patch("/:id", HelpTicketController.updateTicket);
router.delete("/:id", HelpTicketController.deleteTicket);

export default router;
