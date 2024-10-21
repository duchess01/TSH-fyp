import axios from "axios";

const USER_BASE_URL = "http://localhost:3003/api/v1";

export async function unique() {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = {};
    let url = USER_BASE_URL + "/qna/unique";
    const response = await axios.get(url, body, config);
    return response;
  } catch (error) {
    console.log("Error in getting unique qna solutions: ", error);
    return {
      status: error.response.status,
      data: error.response.data.message,
    };
  }
}

export async function machinequestion(machine, question, token) {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const body = {
      machine: machine,
      question: question,
    };

    let url = USER_BASE_URL + "/qna/machinequestion";
    const response = await axios.post(url, body, config);
    return response;
  } catch (error) {
    console.log("Error in getting thread's solutions: ", error);
    return {
      status: error.response?.status || 500,
      data: error.response?.data?.message || "An error occurred",
    };
  }
}
