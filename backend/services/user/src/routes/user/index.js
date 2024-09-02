import express from "express";
import { Router } from "express";
import db from "../../db/db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM users");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
