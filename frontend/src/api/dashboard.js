import axios from "axios";

const ANALYTICS_BASE_URL = "http://localhost:3002";

export async function getTopicDistribution() {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await axios.get(
      ANALYTICS_BASE_URL + "/api/v1/dashboard/topicDistribution",
      config
    );
    return response;
  } catch (error) {
    console.log("Error in get topic distribution API: ", error);
    return {
      status: error.response.status,
      data: error.response.data.message,
    };
  }
}

export async function getMachineDistribution() {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await axios.get(
      ANALYTICS_BASE_URL + "/api/v1/dashboard/machineDistribution",
      config
    );
    return response;
  } catch (error) {
    console.log("Error in get machine distribution API: ", error);
    return {
      status: error.response.status,
      data: error.response.data.message,
    };
  }
}

export async function getLineGraphData() {
  try {
    return {
      status: 200,
      data: {
        January: 10,
        Feburary: 20,
        March: 30,
        April: 40,
        May: 50,
        June: 20,
        July: 70,
        August: 30,
        September: 20,
        October: 10,
        November: 40,
        December: 60,
      },
    };
  } catch (error) {
    console.log("Error in createPortfolio API: ", error);
    return {
      status: error.response.status,
      data: error.response.data.message,
    };
  }
}
