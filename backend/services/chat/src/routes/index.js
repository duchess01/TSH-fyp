import express from "express";
import { Router } from "express";
import healthcheck from "./healthcheck/index.js";
import chat from "./chat/index.js";

const router = Router();

router.use("/healthcheck", healthcheck);
router.use("/chat", chat);

export default router;
