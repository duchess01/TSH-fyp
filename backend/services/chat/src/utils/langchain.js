import axios, { HttpStatusCode } from "axios";

const LANGCHAIN_MICROSERVICE_BASE_URL = "http://localhost:8001/";
const DOCKER_LANGCHAIN_BASE_URL = "http://langchain:8001/";

const isDocker = process.env.DOCKER_ENV === "true";

export async function getLLMResponse(query, userId, sessionId, machine) {
  try {
    let url = isDocker
      ? DOCKER_LANGCHAIN_BASE_URL + `langchain/queryAgent`
      : LANGCHAIN_MICROSERVICE_BASE_URL + `langchain/queryAgent`;

    console.log("this is langhcain url", url);
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = {
      query: query,
      userId: userId,
      chatSessionId: sessionId,
      machine: machine,
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
