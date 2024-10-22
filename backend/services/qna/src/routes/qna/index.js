import express from "express";
import { Router } from "express";
import db from "../../db/db.js";
import multer from "multer";
import axios from "axios";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Retrieve all users' solution
router.get("/getall", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM qna");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Save the user's solution
router.post("/addsolution", upload.single("image"), async (req, res) => {
  const { user_id, question, solution, query_ids, machine } = req.body;
  const image = req.file ? req.file.buffer : null;

  // Checks if any fields are missing
  if (!user_id || !question || !query_ids || !machine) {
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
      "INSERT INTO qna (user_id, topic, question, solution, solution_image, machine) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [user_id, "topic", question, solution, image, machine]
    );

    // Retrieve new query id and append
    newRow = result.rows[0];
    const newQueryIds = [...query_ids, newRow.id];

    // Send the request to LangChain
    const lmmResponse = await axios.post(
      "http://langchain:8001/langchain/qna/upsert",
      {
        query: question,
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

// Handle fetching unique questions and machines with counts and latest date
router.get("/unique", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        question, 
        machine, 
        COUNT(*) AS count, 
        MAX(created_at) AS latest_date
      FROM 
        qna
      GROUP BY 
        question, machine
      ORDER BY 
        latest_date DESC
    `);

    // Check if any unique pairs exist
    if (rows.length === 0) {
      return res.status(404).json({ message: "No unique questions found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching unique questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Handle fetching Q&A data based on machine and question
router.post("/machinequestion", async (req, res) => {
  const { machine, question } = req.body;

  // Validate input
  if (!machine || !question) {
    return res.status(400).json({ error: "Machine and question are required" });
  }

  // Extract the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1]; // Get the token from the header
  if (!token) {
    return res.status(401).json({ error: "Authorization token is required" });
  }

  try {
    // Fetch matching rows from the database, along with like and dislike counts
    const { rows } = await db.query(
      `
      SELECT 
        qna.*, 
        COALESCE(SUM(CASE WHEN r.rating_value = TRUE THEN 1 ELSE 0 END), 0) AS likes,
        COALESCE(SUM(CASE WHEN r.rating_value = FALSE THEN 1 ELSE 0 END), 0) AS dislikes,
        ARRAY_AGG(CASE WHEN r.rating_value = TRUE THEN r.user_id END) AS liked_user_ids,
        ARRAY_AGG(CASE WHEN r.rating_value = FALSE THEN r.user_id END) AS disliked_user_ids
      FROM 
        qna 
      LEFT JOIN 
        ratings r ON qna.id = r.qna_id
      WHERE 
        qna.machine = $1 AND qna.question = $2
      GROUP BY 
        qna.id
    `,
      [machine, question]
    );

    // Check if any rows exist
    if (rows.length === 0) {
      return res.status(404).json({ message: "No matching Q&A found" });
    }

    // Function to fetch user details by ID
    const fetchUserDetails = async (userId) => {
      if (!userId) return null;
      try {
        const response = await axios.get(
          `http://user:3000/api/v1/users/getUserDetails/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Pass the token to the user API
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error(`Error fetching user details for ID ${userId}:`, error);
        return null;
      }
    };

    // Fetch user details for liked and disliked user IDs
    const result = await Promise.all(
      rows.map(async (row) => {
        const likedUsers = await Promise.all(
          row.liked_user_ids.filter((id) => id !== null).map(fetchUserDetails)
        );
        const dislikedUsers = await Promise.all(
          row.disliked_user_ids
            .filter((id) => id !== null)
            .map(fetchUserDetails)
        );

        // Remove liked_user_ids and disliked_user_ids from the response
        const { liked_user_ids, disliked_user_ids, ...rest } = row;

        return {
          ...rest,
          liked_by: likedUsers.filter((user) => user !== null),
          disliked_by: dislikedUsers.filter((user) => user !== null),
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching Q&A data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// RATINGS

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

    // Fetch updated rating data
    const updatedRating = await db.query(
      "SELECT * FROM ratings WHERE qna_id = $1 AND user_id = $2",
      [qna_id, user_id]
    );

    // Return the updated rating data
    res.status(200).json(updatedRating.rows[0]);
  } catch (error) {
    console.error("Error processing rating:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/ratings/:id", async (req, res) => {
  const qna_id = parseInt(req.params.id, 10);

  // Validate input
  if (isNaN(qna_id)) {
    return res.status(400).json({ error: "Invalid qna_id" });
  }

  // Extract the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Authorization token is required" });
  }

  try {
    // Fetch the Q&A entry by qna_id along with likes and dislikes
    const { rows } = await db.query(
      `
      SELECT 
        qna.*, 
        COALESCE(SUM(CASE WHEN r.rating_value = TRUE THEN 1 ELSE 0 END), 0) AS likes,
        COALESCE(SUM(CASE WHEN r.rating_value = FALSE THEN 1 ELSE 0 END), 0) AS dislikes,
        ARRAY_AGG(CASE WHEN r.rating_value = TRUE THEN r.user_id END) AS liked_user_ids,
        ARRAY_AGG(CASE WHEN r.rating_value = FALSE THEN r.user_id END) AS disliked_user_ids
      FROM 
        qna 
      LEFT JOIN 
        ratings r ON qna.id = r.qna_id
      WHERE 
        qna.id = $1
      GROUP BY 
        qna.id
    `,
      [qna_id]
    );

    // Check if any rows exist
    if (rows.length === 0) {
      return res.status(404).json({ message: "No Q&A found for this ID" });
    }

    // Function to fetch user details by ID
    const fetchUserDetails = async (userId) => {
      if (!userId) return null;
      try {
        const response = await axios.get(
          `http://user:3000/api/v1/users/getUserDetails/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error(`Error fetching user details for ID ${userId}:`, error);
        return null;
      }
    };

    // Fetch user details for liked and disliked user IDs
    const result = await Promise.all(
      rows.map(async (row) => {
        const likedUsers = await Promise.all(
          row.liked_user_ids.filter((id) => id !== null).map(fetchUserDetails)
        );
        const dislikedUsers = await Promise.all(
          row.disliked_user_ids
            .filter((id) => id !== null)
            .map(fetchUserDetails)
        );

        // Remove liked_user_ids and disliked_user_ids from the response
        const { liked_user_ids, disliked_user_ids, ...rest } = row;

        return {
          ...rest,
          liked_by: likedUsers.filter((user) => user !== null),
          disliked_by: dislikedUsers.filter((user) => user !== null),
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
