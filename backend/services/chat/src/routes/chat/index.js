import express from "express";
import { Router } from "express";
import db from "../../db/db.js";

const router = Router();

router.post("/", async (req, res) => {
  res.send("Hello from chat");
});

router.get("/", async (req, res) => {
  console.log("called");
  const { rows } = await db.query("SELECT * FROM chat");
  res.status(200).json(rows);
});

// to update "topic" and "response" after getting output from LLM
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { topic, response } = req.body;
  const { rows } = await db.query(
    "UPDATE chat SET topic = $1, response = $2 WHERE id = $3 RETURNING *",
    [topic, response, id]
  );
  res.status(200).json(rows[0]);
});

export default router;
