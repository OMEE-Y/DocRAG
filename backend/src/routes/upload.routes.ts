import { Router } from "express";
import multer from "multer";
import { uploadPDF } from "../controllers/upload.contollers";

const router = Router();

const upload = multer({
  dest: "uploads/",
});

router.post("/", upload.single("file"), uploadPDF);

export default router;
