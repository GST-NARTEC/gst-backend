import express from "express";
import { uploadSingle } from "multermate-es";
import controller from "../controllers/userDoc.js";

const router = express.Router();
const uploadDoc = uploadSingle({
  destination: "uploads/docs",
  filename: "doc",
  fileTypes: ["pdfs", "images"],
});

router.post("/", uploadDoc, controller.createUserDoc);
router.post("/", controller.createUserDoc);
router.put("/:id", uploadDoc, controller.updateUserDoc);
router.delete("/:id", controller.deleteUserDoc);
router.get("/:userId", controller.getUserDocs);

export default router;
