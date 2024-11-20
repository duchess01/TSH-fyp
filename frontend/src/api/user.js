import axios from "axios";

const USER_BASE_URL =
  import.meta.env.VITE_APP_USER_URL || "http://localhost:3000/api/v1";

console.log("USER_BASE_URL", USER_BASE_URL);
export async function login(email, password) {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = {
      email,
      password,
    };
    let url = USER_BASE_URL + "/users/login";
    const response = await axios.post(url, body, config);
    return response;
  } catch (error) {
    console.log("Error in login: ", error);
    return {
      status: error.response.status,
      data: error.response.data.message,
    };
  }
}

export async function getUserDetails(token, userId) {
  try {
    console.log("this is token", token);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    let url = USER_BASE_URL + "/users/getUserDetails/" + userId;
    const response = await axios.get(url, config);
    return response;
  } catch (error) {
    console.log("Error in getUserDetails: ", error);
    return {
      status: error.response.status,
      data: error.response.data.message,
    };
  }
}
