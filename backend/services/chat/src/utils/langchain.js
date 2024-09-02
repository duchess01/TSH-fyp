import axios, { HttpStatusCode } from "axios";

const LANGCHAIN_MICROSERVICE_BASE_URL = "http://localhost:8001/";

export async function getLLMResponse(query, userId, sessionId) {
  try {
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
    const response = await axios.post(
      LANGCHAIN_MICROSERVICE_BASE_URL + "langchain/queryAgent",
      body,
      config
    );
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
