import express from "express";
import { Router } from "express";
import dashboard from "./dashboard/index.js";

const router = Router();

router.use("/dashboard", dashboard);

export default router;
