import express from "express";
import { Router } from "express";
import dashboard from "./dashboard/index.js";
import healthcheck from "./healthcheck/index.js";
import chat from "./chat/index.js";
import user from "./user/index.js";

const router = Router();

router.use("/dashboard", dashboard);
router.use("/healthcheck", healthcheck);
router.use("/chat", chat);
router.use("/users", user);

export default router;
