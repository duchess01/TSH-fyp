import React, { useEffect, useState } from "react";
import BarChart from "../common/BarChart";
import { getTopicDistribution } from "../../api/dashboard";

export default function TopicBarChart({}) {
  const [barChartData, setBarChartData] = useState(null);
  const [barChartOptions, setBarChartOptions] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const getData = async () => {
      let response = await getTopicDistribution();
      if (response.status != 200) {
        console.log("error getting data", response.data);
        setErrorMessage(response.data);
        return;
      }
      let labels = Object.keys(response.data);
      let data = {
        labels,
        datasets: [
          {
            label: "Questions Topic Category",
            data: labels.map((label) => response.data[label] || 0),
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
        ],
      };
      console.log("this is data,", data);
      let options = {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Distribution of Questions by Topics",
          },
        },
      };
      setBarChartData(data);
      setBarChartOptions(options);
    };
    getData();
  }, []);

  return (
    <div className="mb-4 w-full h-full p-5">
      <div className="chart-area w-full h-full">
        {errorMessage && (
          <div className="alert text-danger" role="alert">
            {errorMessage}
          </div>
        )}
        {barChartData && (
          <BarChart data={barChartData} options={barChartOptions} />
        )}
      </div>
    </div>
  );
}
