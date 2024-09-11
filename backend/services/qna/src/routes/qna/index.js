import express from "express";
import { Router } from "express";
import db from "../../db/db.js";

const router = Router();

// Retrieve all users' solution
router.get("/", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM qna");
  res.status(200).json(rows);
});

// Save the user's solution
router.post("/", async (req, res) => {
  const { user_id, topic, title, soltuion } = req.body;

  //Checks if any fields are missing
  if (!user_id || !topic || !title || !soltuion) {
    return res.status(400).json({ error: "All fields are required" });
  }

  //insert data into qna table
  try {
    const result = await db.query(
      "INSERT INTO qna (user_id, topic, title, solution) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, topic, title, solution]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
