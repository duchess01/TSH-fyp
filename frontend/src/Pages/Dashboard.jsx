import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideNavBar from "../components/dashboard/SideNav";
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
      !user ||
      (user.privilege !== "Manager Dashboard" &&
        user.privilege !== "System Admin")
    ) {
      // If unauthorized, set notification and schedule redirect
      setNotification(
        "You do not have access to the Dashboard. Redirecting to login..."
      );
      setIsAuthorized(false);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/login"); // Redirect to login page
      }, 3000);
    } else {
      // If authorized, show the dashboard page
      setIsAuthorized(true);
    }
  }, [navigate]);

  if (isAuthorized === null) {
    // While authorization is being checked, show a blank page
    return null;
  }

  return (
    <div className="text-black bg-slate-300 min-w-screen min-h-screen grid grid-cols-12">
      {notification && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 text-center">
          {notification}
        </div>
      )}
      {isAuthorized && (
        <>
          <SideNavBar />
          <div className="col-span-11 p-10">
            <div className="bg-white w-full min-h-full rounded-lg p-5">
              <FAQSection faqs={faqs} />
              <div className="grid grid-cols-2 grid-rows-2 gap-4 mt-5">
                <CategoryBarChart />
                <QuestionsReceivedLineGraph />
                <MachineBarChart />
                <div className="bg-gray-200 flex items-center justify-center">
                  4
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
