import React, { useEffect, useState } from "react";
import BarChart from "../common/BarChart";
import { getMachineDistribution } from "../../api/dashboard";
import { COLORS } from "../../constants/index.js";
import { getAllMachinesAPI } from "../../api/chat";

export default function MachineBarChart({}) {
  const [barChartData, setBarChartData] = useState(null);
  const [barChartOptions, setBarChartOptions] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const getData = async () => {
      let response = await getMachineDistribution();
      if (response.status != 200) {
        console.error("error getting data", response.data);
        setErrorMessage(response.data);
        return;
      }
      let graphData = {};
      const machineResponse = await getAllMachinesAPI();
      if (response.status === 200) {
        for (let machine in machineResponse.data.data) {
          for (let manual in response.data) {
            if (
              machineResponse.data.data[machine].manual_names.includes(manual)
            ) {
              graphData[machineResponse.data.data[machine].machine_name] =
                response.data[manual];
            } else {
              graphData[manual] = response.data[manual];
            }
          }
        }
      }
      let labels = Object.keys(graphData);
      let data = {
        labels,
        datasets: [
          {
            label: "Questions Machine Category",
            data: labels.map((label) => graphData[label] || 0),
            backgroundColor: COLORS[1],
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
