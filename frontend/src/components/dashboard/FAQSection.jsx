import React from "react";
import { FaArrowRight } from "react-icons/fa6";

const FAQSection = ({ faqs }) => {
  return (
    <section>
      <h2 className="text-black text-3xl mb-2">Top 3 Most Asked Questions</h2>
      <div className="bg-sky-100 p-2 rounded-lg">
        {faqs.map((faq, index) => (
          <div key={index} className="grid grid-cols-4 my-2">
            <div className="flex ml-4">
              <div className="flex items-center">
                <FaArrowRight size={20} color="rgb(59 130 246)" />
              </div>
              <h3 className="text-blue-500 ml-2">{faq.category}:</h3>
            </div>
            <span className="text-gray-500 col-span-3">{faq.question}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
