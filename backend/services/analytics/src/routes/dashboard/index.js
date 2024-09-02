import express from "express";
import { Router } from "express";
import axios, { HttpStatusCode } from "axios";

const router = Router();

router.get("/", async (req, res) => {
  res.send("Hello from dashboard");
});

// getting the frequency of topic asked per day
router.get("/topic", async (req, res) => {
  const isDocker = process.env.DOCKER_ENV === "true";
  let url = isDocker
    ? `http://chat:3001/api/v1/chat/`
    : `http://localhost:3001/api/v1/chat/`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    // manipulate data to get frequency of topic asked
    let topicFrequency = {};
    // filter the data to get the current date and remove rows where topic is null
    const currentDate = new Date().toISOString().split("T")[0];
    const filteredData = data.filter((chat) => {
      return (
        chat.created_at.split("T")[0] === currentDate && chat.topic !== null
      );
    });
    // get the frequency of topic asked
    filteredData.forEach((chat) => {
      if (topicFrequency[chat.topic]) {
        topicFrequency[chat.topic] += 1;
      } else {
        topicFrequency[chat.topic] = 1;
      }
    });
    res.send(HttpStatusCode.Ok, topicFrequency);
  } catch (error) {
    console.error("Error fetching chat data:", error);
    res.send(HttpStatusCode.BadRequest, "Error fetching chat data");
  }
});

export default router;
