import axios, { HttpStatusCode } from "axios";

const CHAT_BASE_URL = "http://localhost:3001/";
const DOCKER_CHAT_BASE_URL = "http://chat:3001/";

function isDocker() {
  return process.env.DOCKER_ENV === "true";
}

export default function getBaseURL() {
  try {
    let url = isDocker
      ? DOCKER_CHAT_BASE_URL + `api/v1/chat/`
      : CHAT_BASE_URL + `api/v1/chat/`;
    return url;
  } catch (error) {
    console.log("Error occured while getting chat base url");
  }
}
