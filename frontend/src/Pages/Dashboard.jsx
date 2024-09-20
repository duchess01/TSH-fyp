import React, { useState, useEffect } from "react";
import SideNavBar from "../components/dashboard/SideNav";
import FAQSection from "../components/dashboard/FAQSection";
import QuestionsReceivedLineGraph from "../components/dashboard/QuestionsReceivedLineGraph";
import TopicBarChart from "../components/dashboard/CategoryBarGraph";
import MachineBarChart from "../components/dashboard/MachineBarGraph";

const DashboardPage = () => {
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

  useEffect(() => {
    // TODO: to be implemented when backend is ready
    const fetchFaqs = async () => {
      const response = await fetch("");
      const data = await response.json();
      setFaqs(data);
    };
    // fetchFaqs();
  });

  return (
    <div className="text-black bg-slate-300 min-w-screen min-h-screen grid grid-cols-12">
      <SideNavBar />
      <div className="col-span-11 p-10">
        <div className="bg-white w-full min-h-full rounded-lg p-5">
          <FAQSection faqs={faqs} />
          <div className="grid grid-cols-2 grid-rows-2 gap-4 mt-5">
            <TopicBarChart />
            <QuestionsReceivedLineGraph />
            <MachineBarChart />
            <div className="bg-gray-200 flex items-center justify-center">
              4
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
