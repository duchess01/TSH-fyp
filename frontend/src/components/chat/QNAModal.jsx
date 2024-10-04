import { PhotoIcon } from "@heroicons/react/24/solid";
import { RxCross2 } from "react-icons/rx";
import {
  FaRegThumbsDown,
  FaRegThumbsUp,
  FaThumbsDown,
  FaThumbsUp,
} from "react-icons/fa";

function QNAModal({ closeModal }) {
  const handleSubmit = () => {
    console.log("SEND TO BE");
  };

  // Change data. Rating will become an array of user ids representing who pressed what.
  const hardCodedData = [
    {
      question: "What to do when I encounter error code 500",
      solution:
        "You need to disconnect the machine and restart the whole system to fix the error.",
      embedding: "Test",
      rating: { likes: 5, dislikes: 1 },
      attachment: null,
    },
    {
      question: "What to do when I encounter error code 500",
      solution: "I'm not sure but, I think you can just ignore the error.",
      embedding: "Test",
      rating: { likes: 0, dislikes: 10 },
      attachment: null,
    },
    {
      question: "What to do when I encounter error code 500",
      solution: "The manual provided answer is incorrect.",
      embedding: "Test",
      rating: { likes: 1, dislikes: 8 },
      attachment: null,
    },
    {
      question: "What to do when I encounter error code 500",
      solution:
        "This is yet another answer that does not provide anything useful.",
      embedding: "Test",
      rating: { likes: 3, dislikes: 21 },
      attachment: null,
    },
    {
      question: "What to do when I encounter error code 500",
      solution:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      embedding: "Test",
      rating: { likes: 3, dislikes: 321 },
      attachment: null,
    },
    {
      question: "What to do when I encounter error code 500",
      solution:
        "Refer to attached image. It explains how to solve the error code.",
      embedding: "Test",
      rating: { likes: 10, dislikes: 1 },
      attachment: "../../Assets/image.png",
    },
  ];

  // Sorting
  const sortedData = hardCodedData.sort((a, b) => {
    const overallRatingA = a.rating.likes - a.rating.dislikes;
    const overallRatingB = b.rating.likes - b.rating.dislikes;
    return overallRatingB - overallRatingA;
  });

  const handleRatingClick = (type, index) => {
    console.log(`${type} button clicked for item ${index}`);
    // Add your logic for handling the rating here (e.g., updating state)
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
        <h1 className="text-xl underline">Machine X</h1>
        <h1 className="text-2xl font-bold border-b pb-2">
          What to do when I encounter error code 500
        </h1>
        {/* END OF HEADER */}

        {/* BODY OF MODAL */}
        <div className="mt-4 overflow-y-auto h-full">
          {sortedData.map((item, index) => (
            <div key={index} className="mb-4 border-b pb-2">
              <p className="font-semibold">{item.solution}</p>
              {item.attachment && (
                <a
                  href={item.attachment}
                  download
                  className="text-blue-500 underline"
                >
                  Download Attachment
                </a>
              )}
              <div className="flex gap mt-2 items-center">
                <button
                  onClick={() => handleRatingClick("Like", index)}
                  className="bg-transparent hover:bg-green-100 p-1 rounded-full"
                  aria-label="Like"
                >
                  <FaRegThumbsUp />
                </button>
                <span className="text-sm">{item.rating.likes}</span>
                <div className="mr-4"></div>
                <button
                  onClick={() => handleRatingClick("Dislike", index)}
                  className="bg-transparent hover:bg-red-100 p-1 rounded-full"
                  aria-label="Dislike"
                >
                  <FaRegThumbsDown />
                </button>
                <span className="text-sm">{item.rating.dislikes}</span>
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
