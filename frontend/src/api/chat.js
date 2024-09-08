import axios from "axios";

const CHAT_BASE_URL = "http://localhost:3001";

export async function sendMessageAPI(chatSessionId, userId, message) {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const data = {
      chatSessionId: chatSessionId,
      userId: userId,
      message: message,
    };

    const response = await axios.post(
      CHAT_BASE_URL + "/api/v1/chat",
      data,
      config
    );
    return response;
  } catch (error) {
    console.log("Error in sending message to backend: ", error);
    return {
      status: error.response ? error.response.status : 500,
      data: error.response ? error.response.data.message : "Server Error",
    };
  }
}

export async function getAllChatHistoryAPI(userId) {
  try {
    const response = await axios.get(
      CHAT_BASE_URL + `/api/v1/chat/allHistory?userId=${userId}`
    );
    return response;
  } catch (error) {
    console.log("Error in getting chat history from backend: ", error);
    return {
      status: error.response ? error.response.status : 500,
      data: error.response ? error.response.data.message : "Server Error",
    };
  }
}