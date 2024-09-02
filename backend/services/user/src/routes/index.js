import express from "express";
import { Router } from "express";
import healthcheck from "./healthcheck/index.js";
import user from "./user/index.js";

const router = Router();

router.use("/healthcheck", healthcheck);
router.use("/users", user);

export default router;
