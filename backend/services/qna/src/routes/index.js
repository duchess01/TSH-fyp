import express from "express";
import { Router } from "express";
import healthcheck from "./healthcheck/index.js";
import qna from "./qna/index.js";

const router = Router();

router.use("/healthcheck", healthcheck);
router.use("/qna", qna);

export default router;
