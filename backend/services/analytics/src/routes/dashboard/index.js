import express from "express";
import { Router } from "express";
import axios, { HttpStatusCode } from "axios";
import getBaseURL from "../../utils/index.js";
import { MONTH_MAPPING } from "../../constants/index.js";

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

// getting the distribution of the topics
router.get("/topicDistribution", async (req, res) => {
  try {
    const CHAT_BASE_URL = getBaseURL();
    const response = await axios.get(CHAT_BASE_URL);
    const data = response.data;
    let topicDistribution = {};
    data.forEach((chat) => {
      if (chat.topic in topicDistribution) {
        topicDistribution[chat.topic] += 1;
      } else {
        topicDistribution[chat.topic] = 1;
      }
    });
    res.status(HttpStatusCode.Ok).json(topicDistribution);
  } catch (error) {
    console.error("Error fetching topic distribution:", error);
    res.status(HttpStatusCode.BadRequest).json({ message: error.message });
  }
});

// getting the distribution of the machines
router.get("/machineDistribution", async (req, res) => {
  try {
    const CHAT_BASE_URL = getBaseURL();
    const response = await axios.get(CHAT_BASE_URL);
    const data = response.data;
    let machineDistribution = {};
    data.forEach((chat) => {
      if (chat.machine in machineDistribution) {
        machineDistribution[chat.machine] += 1;
      } else {
        machineDistribution[chat.machine] = 1;
      }
    });
    res.status(HttpStatusCode.Ok).json(machineDistribution);
  } catch (error) {
    console.error("Error fetching machine distribution:", error);
    res.status(HttpStatusCode.BadRequest).json({ message: error.message });
  }
});

// getting the frequency of the questions asked for the current year in months
router.get("/frequencyInAYear", async (req, res) => {
  try {
    const CHAT_BASE_URL = getBaseURL();
    const response = await axios.get(CHAT_BASE_URL);
    const data = response.data;
    let frequencyInAYear = {};
    // getting the data in the current year
    const currentDate = new Date().toISOString().split("-")[0];
    const filteredData = data.filter((chat) => {
      return chat.created_at.split("-")[0] === currentDate;
    });
    filteredData.forEach((chat) => {
      const month = MONTH_MAPPING[parseInt(chat.created_at.split("-")[1])];
      if (month in frequencyInAYear) {
        frequencyInAYear[month] += 1;
      } else {
        frequencyInAYear[month] = 1;
      }
    });
    res.status(HttpStatusCode.Ok).json(frequencyInAYear);
  } catch (error) {
    console.error("Error fetching frequency in a year:", error);
    res.status(HttpStatusCode.BadRequest).json({ message: error.message });
  }
});

export default router;
