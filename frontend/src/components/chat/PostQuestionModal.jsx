import { PhotoIcon } from "@heroicons/react/24/solid";
import { RxCross2 } from "react-icons/rx";
import { useState } from "react";
import { addSolution } from "../../api/qna";
import Swal from "sweetalert2";
import { MACHIINES } from "../../constants";

function PostQuestionModal({ closeModal }) {
  const [selectedMachine, setSelectedMachine] = useState("");
  const [question, setQuestion] = useState("");
  const [solution, setSolution] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageFileName, setImageFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileName(file.name);
    } else {
      setImageFile(null);
      setImageFileName("");
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const user_id = JSON.parse(sessionStorage.getItem("user")).id;
    const query_ids = [];

    try {
      const response = await addSolution(
        user_id,
        question,
        solution,
        query_ids,
        imageFile,
        selectedMachine,
        sessionStorage.getItem("token")
      );
      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.data.message,
          customClass: {
            popup: "custom-swal",
          },
        });

        closeModal();
      } else {
        console.error("Error adding solution:", response);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong. Please try again.",
          customClass: {
            popup: "custom-swal",
          },
        });
      }
    } catch (error) {
      console.error("Error during submission:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong. Please try again.",
        customClass: {
          popup: "custom-swal",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const machines = MACHIINES;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={() => closeModal()}
      ></div>
      <div className="p-6 rounded-lg shadow-lg z-10 w-3/4 h-3/4 flex flex-col relative overflow-hidden modalBGC">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-white hover:text-gray-400"
          aria-label="Close"
        >
          <RxCross2 className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4 underline">Post a Question</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <label
            htmlFor="machine"
            className="block text-lg font-medium leading-6 text-white"
          >
            Select Machine
          </label>
          <select
            id="machine"
            name="machine"
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            className="block w-full mt-2 mb-4 rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
            className="block text-lg font-medium leading-6 text-white"
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
              className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Type your question here..."
            />
          </div>

          <label
            htmlFor="solution"
            className="block text-lg font-medium leading-6 text-white mt-4"
          >
            Solution
          </label>
          <div className="mt-2">
            <textarea
              id="solution"
              name="solution"
              rows={3}
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Type your solution here..."
            />
          </div>

          <label
            htmlFor="cover-photo"
            className="block text-lg font-medium leading-6 text-white mt-4"
          >
            Solution Image
          </label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-white-900/25">
            <div className="text-center">
              <PhotoIcon
                aria-hidden="true"
                className="mx-auto h-12 w-12 text-white"
              />
              <div className="mt-4 flex flex-col text-sm leading-6">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-bold text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-400"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept="image/*,.pdf"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
                {imageFileName && (
                  <p className="mt-2 text-sm text-white font-bold truncate">
                    {imageFileName}
                  </p>
                )}
              </div>
              <p className="text-xs leading-5 text-white">
                PNG, JPG, GIF, or PDF
              </p>
            </div>
          </div>
        </form>
        <div className="flex gap-4 justify-end mt-4 mb-6">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 0114.45-4.95A8 8 0 106.59 20.95A8 8 0 014 12z"
                  />
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostQuestionModal;
