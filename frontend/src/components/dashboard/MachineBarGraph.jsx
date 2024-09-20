import React, { useEffect, useState } from "react";
import BarChart from "../common/BarChart";
import { getMachineDistribution } from "../../api/dashboard";

export default function MachineBarChart({}) {
  const [barChartData, setBarChartData] = useState(null);
  const [barChartOptions, setBarChartOptions] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const getData = async () => {
      let response = await getMachineDistribution();
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
            label: "Questions Machine Category",
            data: labels.map((label) => response.data[label] || 0),
            backgroundColor: "rgba(99, 132, 132, 0.5)",
          },
        ],
      };
      let options = {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Distribution of Questions by Machine",
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
