import axios, { HttpStatusCode } from "axios";

const LANGCHAIN_MICROSERVICE_BASE_URL = "http://localhost:8001/";
const DOCKER_LANGCHAIN_BASE_URL = "http://langchain:3002/";

function isDocker() {
  return process.env.DOCKER_ENV === "true";
}

export async function getLLMResponse(query, userId, sessionId) {
  try {
    let url = isDocker
      ? DOCKER_LANGCHAIN_BASE_URL + `api/v1/chat/`
      : LANGCHAIN_MICROSERVICE_BASE_URL + `api/v1/chat/`;

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = {
      query: query,
      userId: userId,
      sessionId: sessionId,
    };
    const response = await axios.post(url, body, config);
    const data = response.data;
    return data;
  } catch (error) {
    console.log("Error in sending message to Langchain: ", error);
    return {
      status: error.response ? error.response.status : 500,
      data: error.response ? error.response.data.message : "Server Error",
    };
  }
}
