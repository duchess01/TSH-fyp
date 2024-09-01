import express from "express";
import { Router } from "express";
import db from "../../db/db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM chat");
  res.status(200).json(rows);
});

// to update "topic" and "response" after getting output from LLM
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { topic, response } = req.body;
    const { rows } = await db.query(
      "UPDATE chat SET topic = $1, response = $2 WHERE id = $3 RETURNING *",
      [topic, response, id]
    );
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// getting last 3 chat messages
router.get("/history", async (req, res) => {
  try {
    const { userId, chatSessionId } = req.query;
    const { rows } = await db.query(
      "SELECT * FROM chat WHERE chat_session_id = $1 AND user_id = $2 ORDER BY id DESC LIMIT 3",
      [chatSessionId, userId]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: "No chat history found" });
    } else {
      res
        .status(200)
        .json(rows.map(({ message, response }) => ({ message, response })));
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
