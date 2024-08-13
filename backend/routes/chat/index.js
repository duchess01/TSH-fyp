import express from "express";
import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  res.send("Hello from chat");
});

export default router;
