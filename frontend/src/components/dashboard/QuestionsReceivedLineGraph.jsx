import React, { useEffect, useState } from "react";
import { getLineGraphData } from "../../api/dashboard";
import AreaChart from "../common/AreaChart";

export default function QuestionsReceivedLineGraph({}) {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const getData = async () => {
      setErrorMessage("");
      let labels = [];
      let datasets = [];
      const response = await getLineGraphData();
      if (response.status != 200) {
        console.log("Error in fetching data", response.data);
        setChartData({});
        setChartOptions({});
        setErrorMessage(response.data);
        return;
      }
      labels = Object.keys(response.data);
      datasets = [
        {
          label: "Questions Received",
          data: Object.values(response.data),
          borderColor: "rgba(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
        },
      ];
      const data = {
        labels,
        datasets: datasets,
      };
      const options = {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Number of Questions Received per Month",
          },
        },
        scales: {
          x: {
            ticks: {
              callback: function (value, index, ticks) {
                return this.getLabelForValue(value);
              },
            },
          },
        },
      };
      setChartData(data);
      setChartOptions(options);
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
        {chartData &&
          chartOptions &&
          chartData.datasets &&
          chartData.datasets.length > 0 &&
          Object.keys(chartOptions).length !== 0 && (
            <AreaChart data={chartData} options={chartOptions} />
          )}
      </div>
    </div>
  );
}
