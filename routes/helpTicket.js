import express from "express";
import { uploadSingle } from "multermate-es";
import HelpTicketController from "../controllers/helpTicket.js";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();
const upload = uploadSingle({
  destination: "uploads/images",
  filename: "doc",
  fileTypes: ["images"],
});

// Protect all routes
router.use(verifyAccessToken);

router.post("/", upload, HelpTicketController.createTicket);
router.get("/", HelpTicketController.getTickets);
router.get("/:id", HelpTicketController.getTicket);
router.patch("/:id", HelpTicketController.updateTicket);
router.delete("/:id", HelpTicketController.deleteTicket);

export default router;
