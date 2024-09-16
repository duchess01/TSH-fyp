import express from "express";
import { Router } from "express";
import db from "../../db/db.js";
import multer from "multer";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Retrieve all users' solution
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM qna");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Save the user's solution
router.post("/", upload.single("image"), async (req, res) => {
  const { user_id, topic, title, solution } = req.body;
  const image = req.file ? req.file.buffer : null;

  //Checks if any fields are missing
  if (!user_id || !topic || !title) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!solution && image == null) {
    return res
      .status(400)
      .json({ error: "Atleast solution or image needs to be filled." });
  }

  //insert data into qna table
  try {
    const result = await db.query(
      "INSERT INTO qna (user_id, topic, title, solution, solution_image) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id, topic, title, solution, image]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
