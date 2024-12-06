import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideNavBar from "../components/admin/sidebar";
import FAQSection from "../components/dashboard/FAQSection";
import QuestionsReceivedLineGraph from "../components/dashboard/QuestionsReceivedLineGraph";
import TopicBarChart from "../components/dashboard/CategoryBarGraph";
import MachineBarChart from "../components/dashboard/MachineBarGraph";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([
    {
      category: "Error Code",
      question: "What does error code 230 mean on machine X?",
      answer: "XXX",
    },
    {
      category: "Maintenance",
      question: "What are the maintenance procedures on machine y?",
      answer: "XXX",
    },
    {
      category: "Settings",
      question: "How to change color to pink on CMC machine?",
      answer: "XXX",
    },
  ]);
  const [notification, setNotification] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (
      !token ||
      !user || // looping through user.privileges to see if it includes "System Admin" or "Manager Dashboard"
      (!user.privileges.includes("System Admin") &&
        !user.privileges.includes("Manager Dashboard"))
    ) {
      setNotification(
        "You do not have access to the Dashboard. Redirecting to login..."
      );
      setIsAuthorized(false);

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  if (isAuthorized === null) {
    return null;
  }

  return (
    <div className="text-black bg-slate-300">
      {notification && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-50">
          {notification}
        </div>
      )}
      {isAuthorized && (
        <div className="flex min-h-screen">
          <div className="fixed h-screen">
            <SideNavBar />
          </div>
          <div className="flex-1 ml-72 p-10">
            {" "}
            {/* Adjust ml-64 based on your sidebar width */}
            <div className="bg-white w-full min-h-full rounded-lg p-5">
              {/* <FAQSection faqs={faqs} /> */}
              <h2 className="text-black text-3xl mb-2">
                Analytics on Questions Asked
              </h2>
              <div className="grid grid-cols-2 grid-rows-2 gap-4 mt-5">
                {/* <TopicBarChart /> */}
                <MachineBarChart />
                <QuestionsReceivedLineGraph />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
