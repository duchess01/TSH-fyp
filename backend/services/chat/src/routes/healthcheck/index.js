import express from "express";
import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date(),
  });
});

export default router;
