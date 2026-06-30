import { Router } from "express";
import { chat } from "../controllers/chat.controllers";

const router = Router();

router.post("/", chat);

export default router;
