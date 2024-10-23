import axios from "axios";

const USER_BASE_URL = "http://localhost:3003/api/v1";

export async function unique(token) {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const body = {};
    let url = USER_BASE_URL + "/qna/unique";
    const response = await axios.get(url, config);
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

export async function rate(qna_id, user_id, rating_value, token) {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const body = {
      qna_id,
      user_id,
      rating_value,
    };

    let url = USER_BASE_URL + "/qna/rate";
    const response = await axios.post(url, body, config);
    return response;
  } catch (error) {
    console.log("Error in rating: ", error);
    return {
      status: error.response?.status || 500,
      data: error.response?.data?.message || "An error occurred",
    };
  }
}

export async function addSolution(
  user_id,
  question,
  solution,
  query_ids,
  imageFile,
  machine,
  token
) {
  try {
    const formData = new FormData();

    formData.append("user_id", user_id);
    formData.append("question", question.trim());
    formData.append("solution", solution.trim());
    formData.append("query_ids", JSON.stringify(query_ids));
    formData.append("machine", machine);

    if (imageFile) {
      formData.append("image", imageFile);
      formData.append("image_type", imageFile.type);
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    const url = `${USER_BASE_URL}/qna/addsolution`;
    const response = await axios.post(url, formData, config);
    return response;
  } catch (error) {
    console.log("Error in adding solution: ", error);
    return {
      status: error.response?.status || 500,
      data: error.response?.data?.message || "An error occurred",
    };
  }
}
