import { PhotoIcon } from "@heroicons/react/24/solid";
import { RxCross2 } from "react-icons/rx";
import { useState } from "react";

function PostQuestionModal({ closeModal }) {
  const [selectedMachine, setSelectedMachine] = useState("");
  const [question, setQuestion] = useState("");

  const handleSubmit = () => {
    console.log("Machine:", selectedMachine);
    console.log("Question:", question);
    // Here you can add your logic to send the data
  };

  const machines = [
    "Machine X",
    "Machine Y",
    "Machine Z",
    // Add more machines as needed
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={() => closeModal()}
      ></div>
      <div className="bg-white p-6 rounded-lg shadow-lg z-10 w-3/4 h-3/4 flex flex-col relative overflow-hidden">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          aria-label="Close"
        >
          <RxCross2 className="h-6 w-6" />
        </button>

        {/* MACHINE SELECTION AND QUESTION INPUT */}
        <h2 className="text-2xl font-bold mb-4 underline">Post a Question</h2>
        <form>
          <label
            htmlFor="machine"
            className="block text-lg font-medium leading-6 text-gray-900"
          >
            Select Machine
          </label>
          <select
            id="machine"
            name="machine"
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            className="block w-full mt-2 mb-4 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="" disabled>
              Select a machine
            </option>
            {machines.map((machine, index) => (
              <option key={index} value={machine}>
                {machine}
              </option>
            ))}
          </select>

          <label
            htmlFor="question"
            className="block text-lg font-medium leading-6 text-gray-900"
          >
            Your Question
          </label>
          <div className="mt-2">
            <input
              id="question"
              name="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Type your question here..."
            />
          </div>

          <label
            htmlFor="about"
            className="block text-lg font-medium leading-6 text-gray-900 mt-4"
          >
            Solution
          </label>
          <div className="mt-2">
            <textarea
              id="about"
              name="about"
              rows={3}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              defaultValue={""}
            />
          </div>
          <label
            htmlFor="cover-photo"
            className="block text-lg font-medium leading-6 text-gray-900 mt-4"
          >
            Solution Image
          </label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25">
            <div className="text-center">
              <PhotoIcon
                aria-hidden="true"
                className="mx-auto h-12 w-12 text-gray-300"
              />
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-600">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        </form>
        <div className="flex gap-4 justify-end mt-4 mb-6">
          <button
            onClick={() => {
              handleSubmit();
              closeModal();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </div>

        {/* END OF USER ENTERED SOLUTION */}
      </div>
    </div>
  );
}

export default PostQuestionModal;
