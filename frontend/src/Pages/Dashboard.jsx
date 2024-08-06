import React, { useState, useEffect } from "react";
import SideNavBar from "../components/dashboard/SideNav";
import FAQSection from "../components/dashboard/FAQSection";

const DashboardPage = () => {
  const [faqs, setFaqs] = useState([
    {
      question: "What is React?",
      answer: "React is a JavaScript library for building user interfaces.",
    },
    {
      question: "How does React work?",
      answer:
        "React creates a virtual DOM and efficiently updates the real DOM.",
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
        <div className="bg-white w-full h-full rounded-lg p-5">
          <FAQSection faqs={faqs} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
