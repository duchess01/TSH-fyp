import React from "react";
import { FaArrowRight } from "react-icons/fa6";

const FAQSection = ({ faqs }) => {
  return (
    <section>
      <h2 className="text-black text-3xl mb-2">Top 5 Most Asked Questions</h2>
      <div className="bg-sky-100 p-2 rounded-lg">
        {faqs.map((faq, index) => (
          <div key={index} className="grid grid-cols-4">
            <div className="flex">
              <FaArrowRight size={20} color="blue" />
              <h3 className="text-blue-600 ml-5">{faq.question}</h3>
            </div>
            <span className="text-black col-span-3">{faq.answer}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
