import axios from "axios";

const CHAT_BASE_URL = "http://localhost:3001";

export async function sendMessageAPI(
  chatSessionId,
  userId,
  message,
  machine,
  token
) {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const data = {
      chatSessionId: String(chatSessionId),
      userId: userId,
      message: message,
      machine: machine,
      token: token,
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

export async function getAllChatHistoryAPI(userId, token) {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(
      CHAT_BASE_URL + `/api/v1/chat/allHistory?userId=${userId}`,
      config
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

export async function changeRating(msgId, rating) {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const data = {
      id: msgId,
      rating: rating,
    };
    const response = await axios.post(
      CHAT_BASE_URL + "/api/v1/chat/rating",
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

export async function getAllMachinesAPI() {
  try {
    const response = await axios.get(
      "http://localhost:8000/manual/machine-mappings"
    );
    return response;
  } catch (error) {
    console.log("Error in getting machines from backend: ", error);
    return {
      status: error.response ? error.response.status : 500,
      data: error.response ? error.response.data.message : "Server Error",
    };
  }
}
