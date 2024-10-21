import { PhotoIcon } from "@heroicons/react/24/solid";
import { RxCross2 } from "react-icons/rx";
import {
  FaRegThumbsDown,
  FaRegThumbsUp,
  FaThumbsDown,
  FaThumbsUp,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { machinequestion } from "../../api/qna";

function QNAModal({ closeModal, machine, question }) {
  const [data, setData] = useState([]);

  const handleSubmit = () => {
    console.log("SEND TO BE");
  };

  useEffect(() => {
    const fetchMachineQuestion = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found in sessionStorage");
        return;
      }
      const response = await machinequestion(machine, question, token);
      if (response && response.data) {
        setData(response.data);
        console.log(response.data);
      }
    };

    fetchMachineQuestion();
  }, [machine, question]);

  // Sorting based on likes and dislikes
  const sortedData = [...data].sort((a, b) => {
    const overallRatingA = a.likes - a.dislikes;
    const overallRatingB = b.likes - b.dislikes;
    return overallRatingB - overallRatingA;
  });

  const handleRatingClick = (type, index) => {
    console.log(`${type} button clicked for item ${index}`);
    // Add your logic for handling the rating here
  };

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

        {/* HEADER OF MODAL */}
        <h1 className="text-xl underline">{machine}</h1>
        <h1 className="text-2xl font-bold border-b pb-2">{question}</h1>
        {/* END OF HEADER */}

        {/* BODY OF MODAL */}
        <div className="mt-4 overflow-y-auto h-full">
          {sortedData.map((item, index) => (
            <div key={item.id} className="mb-4 border-b pb-2">
              <p className="font-semibold">{item.solution}</p>
              {item.solution_image && (
                <img
                  src={item.solution_image}
                  alt="Solution"
                  className="mt-2"
                />
              )}
              <div className="flex gap mt-2 items-center">
                <button
                  onClick={() => handleRatingClick("Like", index)}
                  className="bg-transparent hover:bg-green-100 p-1 rounded-full"
                  aria-label="Like"
                >
                  <FaRegThumbsUp />
                </button>
                <span className="text-sm">{item.likes}</span>
                <div className="mr-4"></div>
                <button
                  onClick={() => handleRatingClick("Dislike", index)}
                  className="bg-transparent hover:bg-red-100 p-1 rounded-full"
                  aria-label="Dislike"
                >
                  <FaRegThumbsDown />
                </button>
                <span className="text-sm">{item.dislikes}</span>
              </div>
            </div>
          ))}
          {/* END OF BODY */}

          {/* USER ENTERED SOLUTION */}
          <h2 className="text-xl font-semibold mb-4 underline">Your Answer</h2>
          <form>
            <label
              htmlFor="about"
              className="block text-lg font-medium leading-6 text-gray-900"
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
    </div>
  );
}

export default QNAModal;
