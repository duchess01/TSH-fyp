import express from "express";
import { Router } from "express";
import db from "../../db/db.js";
import { getLLMResponse } from "../../utils/langchain.js";

const router = Router();

router.get("/", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM chat");
  res.status(200).json(rows);
});

//change rating
router.post("/rating", async (req, res) => {
  try {
    const { id, rating } = req.body;

    //Check if both id and rating is provided
    if (typeof id === "undefined" || typeof rating === "undefined") {
      return res.status(400).json({ message: "Id and rating are required" });
    }

    const updateQuery = "UPDATE chat SET rating = $1 WHERE id = $2 RETURNING *";
    const updateValues = [rating, id];

    const result = await db.query(updateQuery, updateValues);

    //msg with id not found
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Chat not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
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

// getting all chat history of a user
router.get("/allHistory", async (req, res) => {
  try {
    const { userId } = req.query;
    const { rows } = await db.query("SELECT * FROM chat WHERE user_id = $1", [
      userId,
    ]);
    res.status(200).json(rows);
  } catch (error) {
    console.log("this iss error", error);
    res.status(400).json({ message: error.message });
  }
});

// getting last 3 chat messages in a chat session
router.get("/history", async (req, res) => {
  try {
    const { userId, chatSessionId } = req.query;
    const { rows } = await db.query(
      "SELECT * FROM chat WHERE chat_session_id = $1 AND user_id = $2 ORDER BY id DESC LIMIT 3",
      [chatSessionId, userId]
    );
    rows.reverse();
    if (rows.length === 0) {
      res.status(200).send("");
    } else {
      res.status(200).json(
        rows.map(({ message, response, topic, id }) => ({
          message,
          response,
          topic,
          id,
        }))
      );
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// sending a message
router.post("/", async (req, res) => {
  try {
    const { chatSessionId, userId, message, machine } = req.body;

    // Query to see if chat session already exists in the db
    const { rows: existingChats } = await db.query(
      "SELECT * FROM chat WHERE chat_session_id = $1 AND user_id = $2",
      [chatSessionId, userId]
    );
    // Determine the title based on whether the chat session already exists
    const title = existingChats.length === 0 ? message : existingChats[0].title;

    // Make a call to the Langchain microservice to get a response and topic
    const langchainResponse = await getLLMResponse(
      message,
      String(userId),
      chatSessionId,
      machine
    );
    // const langchainResponse = {
    //   status_code: 201,
    //   message: "success",
    //   topic: "test",
    //   user_query: "hello",
    //   agent_response:
    //     "Question: hello  \n" +
    //     "Thought: The input does not contain a specific question regarding status codes or error codes. I need to wait for a valid question to proceed.  \n" +
    //     "Action: None",
    // };
    if (langchainResponse.status_code !== 201) {
      res.status(langchainResponse.status).json(langchainResponse.data);
      return;
    }

    // Destructure the response and topic from the Langchain service
    const { agent_response, topic } = langchainResponse;

    // Insert the fully populated record into the database
    const insertQuery = `
      INSERT INTO chat (chat_session_id, user_id, title, message, response, topic, machine)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const insertValues = [
      chatSessionId,
      userId,
      title,
      message,
      agent_response,
      topic,
      machine,
    ];
    const { rows } = await db.query(insertQuery, insertValues);

    // Return the inserted record as the response
    return res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
