import express from "express";
import { Router } from "express";
import db from "../../db/db.js";
import multer from "multer";
import axios from "axios";
import { verifyToken } from "../../middleware/authMiddleware.js";
// import { verify } from "jsonwebtoken";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Retrieve all users' solution
router.get("/getall", verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM qna");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Save the user's solution
router.post(
  "/addsolution",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    const { user_id, question, solution, query_ids, machine } = req.body;
    const image = req.file ? req.file.buffer : null;
    const imageType = req.file ? req.file.mimetype : null;

    let idsToUse = Array.isArray(query_ids)
      ? query_ids
      : JSON.parse(query_ids || "[]");

    if (!user_id || !question || !machine) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (!solution && image == null) {
      return res
        .status(400)
        .json({ error: "At least solution or image needs to be filled." });
    }

    let newRow;
    let newThread = true;
    try {
      if (idsToUse.length === 0) {
        const existingQueryResult = await db.query(
          "SELECT id FROM qna WHERE question = $1",
          [question]
        );
        if (existingQueryResult.rows.length !== 0) {
          newThread = false;
        }
        idsToUse = existingQueryResult.rows.map((row) => row.id);
      }

      const result = await db.query(
        "INSERT INTO qna (user_id, topic, question, solution, solution_image, solution_image_type, machine) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [user_id, "topic", question, solution, image, imageType, machine]
      );

      newRow = result.rows[0];
      idsToUse.push(newRow.id);

      // Send the request to LangChain
      const lmmResponse = await axios.post(
        "http://langchain:8001/langchain/qna/upsert",
        {
          query: question,
          ids: idsToUse.map(String),
        }
      );

      if (lmmResponse.data.status !== "success") {
        await db.query("DELETE FROM qna WHERE id = $1", [newRow.id]);
        return res
          .status(400)
          .json({ error: "Upsert failed, created data has been deleted." });
      }

      const message = newThread
        ? "Successfully created a new thread."
        : "Successfully added to existing thread.";

      res.status(201).json({
        message,
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error inserting data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Handle fetching unique questions and machines with counts and latest date
router.get("/unique", verifyToken, async (req, res) => {
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
router.post("/machinequestion", verifyToken, async (req, res) => {
  const { machine, question } = req.body;

  if (!machine || !question) {
    return res.status(400).json({ error: "Machine and question are required" });
  }

  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  try {
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

    if (rows.length === 0) {
      return res.status(404).json({ message: "No matching Q&A found" });
    }

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
router.post("/rate", verifyToken, async (req, res) => {
  const { qna_id, user_id, rating_value } = req.body;

  if (qna_id === undefined || user_id === undefined) {
    return res.status(400).json({ error: "qna_id and user_id are required" });
  }

  try {
    if (rating_value === null) {
      await db.query("DELETE FROM ratings WHERE qna_id = $1 AND user_id = $2", [
        qna_id,
        user_id,
      ]);
    } else {
      const { rowCount } = await db.query(
        "SELECT 1 FROM ratings WHERE qna_id = $1 AND user_id = $2",
        [qna_id, user_id]
      );

      if (rowCount > 0) {
        await db.query(
          "UPDATE ratings SET rating_value = $1, created_at = CURRENT_TIMESTAMP WHERE qna_id = $2 AND user_id = $3",
          [rating_value, qna_id, user_id]
        );
      } else {
        await db.query(
          "INSERT INTO ratings (qna_id, user_id, rating_value) VALUES ($1, $2, $3)",
          [qna_id, user_id, rating_value]
        );
      }
    }

    const updatedRating = await db.query(
      "SELECT * FROM ratings WHERE qna_id = $1 AND user_id = $2",
      [qna_id, user_id]
    );

    res.status(200).json(updatedRating.rows[0]);
  } catch (error) {
    console.error("Error processing rating:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/ratings/:id", verifyToken, async (req, res) => {
  const qna_id = parseInt(req.params.id, 10);

  if (isNaN(qna_id)) {
    return res.status(400).json({ error: "Invalid qna_id" });
  }

  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1]; // Extract the token

  try {
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

    if (rows.length === 0) {
      return res.status(404).json({ message: "No Q&A found for this ID" });
    }

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

// Integration with Chatbot + retrieveQna
router.post("/chatbot", async (req, res) => {
  const { query } = req.body;

  try {
    const retrieveQna = await axios.post(
      "http://langchain:8001/langchain/qna/retrieveQna",
      { query: query }
    );

    if (retrieveQna && retrieveQna.data && retrieveQna.data.ids) {
      const idsArray = retrieveQna.data.ids;
      const results = [];

      for (const ids of idsArray) {
        if (ids.length > 0) {
          const data = await fetchQnaDataByIds(ids);
          // Store data as an array in results
          results.push(data);
        } else {
          results.push([]); // Retain empty array for empty IDs
        }
      }

      // Fetch likes and dislikes for each Q&A item in the results
      const enrichedResults = await Promise.all(
        results.map(async (dataArray) => {
          return await Promise.all(
            dataArray.map(async (item) => {
              return await fetchQnaLikesDislikes(req, item.id);
            })
          );
        })
      );

      res.status(200).json({ status: "success", data: enrichedResults });
    } else {
      res.status(404).json({ error: "No IDs found" });
    }
  } catch (error) {
    console.error("Error retrieving data for chatbot:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API to return the data by ids
// Function to fetch QnA data by IDs
async function fetchQnaDataByIds(ids) {
  const idList = ids.map((id) => parseInt(id, 10));

  const placeholders = idList.map((_, index) => `$${index + 1}`).join(",");
  const query = `SELECT * FROM qna WHERE id IN (${placeholders})`;

  try {
    const { rows } = await db.query(query, idList);
    return rows; // Return the rows as is
  } catch (error) {
    console.error("Error fetching QnA data:", error);
    throw new Error("Database query failed");
  }
}

// Function to fetch likes and dislikes for a given Q&A ID
async function fetchQnaLikesDislikes(req, qnaId) {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  try {
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
      [qnaId]
    );

    if (rows.length === 0) {
      return null; // Or handle the case where no Q&A found
    }

    const row = rows[0];

    // Fetch user details for liked and disliked users
    const likedUsers = await Promise.all(
      row.liked_user_ids
        .filter((id) => id !== null)
        .map((id) => fetchUserDetails(token, id))
    );
    const dislikedUsers = await Promise.all(
      row.disliked_user_ids
        .filter((id) => id !== null)
        .map((id) => fetchUserDetails(token, id))
    );

    const { liked_user_ids, disliked_user_ids, ...rest } = row;

    return {
      ...rest,
      liked_by: likedUsers.filter((user) => user !== null),
      disliked_by: dislikedUsers.filter((user) => user !== null),
    };
  } catch (error) {
    console.error("Error fetching likes and dislikes:", error);
    throw new Error("Database query failed");
  }
}

// Function to fetch user details
async function fetchUserDetails(token, userId) {
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
}

export default router;
