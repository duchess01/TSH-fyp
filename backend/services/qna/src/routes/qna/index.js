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
  const { user_id, question, solution, query_ids } = req.body;
  const image = req.file ? req.file.buffer : null;

  // Checks if any fields are missing
  if (!user_id || !question || !query_ids) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!solution && image == null) {
    return res
      .status(400)
      .json({ error: "At least solution or image needs to be filled." });
  }

  // Insert data into qna table
  let newRow;
  try {
    const result = await db.query(
      "INSERT INTO qna (user_id, topic, question, solution, solution_image) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id, "topic", question, solution, image]
    );

    //Retrieve new query id and append
    newRow = result.rows[0];
    const newQueryIds = [...query_ids, newRow.id];

    // Send the request to LangChain
    const lmmResponse = await axios.post(
      "http://localhost:8001/langchain/qna/upsert",
      {
        query: title,
        ids: newQueryIds.map(String),
      }
    );

    // Check the response from the Axios POST request
    if (lmmResponse.data.status !== "success") {
      // If the status is not success, delete the previously created row
      await db.query("DELETE FROM qna WHERE id = $1", [newRow.id]);
      return res
        .status(400)
        .json({ error: "Upsert failed, created data has been deleted." });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Handle ratings
router.post("/rate", async (req, res) => {
  const { qna_id, user_id, rating_value } = req.body;

  // Validate input
  if (qna_id === undefined || user_id === undefined) {
    return res.status(400).json({ error: "qna_id and user_id are required" });
  }

  try {
    if (rating_value === null) {
      // If rating_value is null, delete the existing rating
      await db.query("DELETE FROM ratings WHERE qna_id = $1 AND user_id = $2", [
        qna_id,
        user_id,
      ]);
    } else {
      // Check if the user already has a rating
      const { rowCount } = await db.query(
        "SELECT 1 FROM ratings WHERE qna_id = $1 AND user_id = $2",
        [qna_id, user_id]
      );

      if (rowCount > 0) {
        // Update existing rating
        await db.query(
          "UPDATE ratings SET rating_value = $1, created_at = CURRENT_TIMESTAMP WHERE qna_id = $2 AND user_id = $3",
          [rating_value, qna_id, user_id]
        );
      } else {
        // Insert new rating
        await db.query(
          "INSERT INTO ratings (qna_id, user_id, rating_value) VALUES ($1, $2, $3)",
          [qna_id, user_id, rating_value]
        );
      }
    }

    res.status(200).json({ message: "Rating processed successfully" });
  } catch (error) {
    console.error("Error processing rating:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
