import express from "express";
import { Router } from "express";
import db from "../../db/db.js";

const router = Router();

router.post("/", async (req, res) => {
  res.send("Hello from chat");
});

router.get("/", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM chat");
  res.status(200).json(rows);
});

export default router;
