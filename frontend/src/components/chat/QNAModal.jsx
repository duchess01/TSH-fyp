import { PhotoIcon } from "@heroicons/react/24/solid";
import { RxCross2 } from "react-icons/rx";
import {
  FaRegThumbsDown,
  FaRegThumbsUp,
  FaThumbsDown,
  FaThumbsUp,
} from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { machinequestion, addSolution, rate } from "../../api/qna";
import Swal from "sweetalert2";
import { Tooltip } from "@mui/material";
import { format } from "date-fns";

function QNAModal({ closeModal, machine, question }) {
  const [data, setData] = useState([]);
  const [userSolution, setUserSolution] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageFileName, setImageFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const modalBodyRef = useRef(null);

  const fetchMachineQuestion = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found in sessionStorage");
      return;
    }
    const response = await machinequestion(machine, question, token);
    if (response && response.data) {
      setData(response.data);
    }
  };

  const handleRatingClick = async (type, item) => {
    const isLiked = item.liked_by.some((u) => u.id === user.id);
    const isDisliked = item.disliked_by.some((u) => u.id === user.id);

    let rating;

    if (type === "Like") {
      rating = isLiked ? null : true; // Toggle like
    } else if (type === "Dislike") {
      rating = isDisliked ? null : false; // Toggle dislike
    }

    const response = await rate(
      item.id,
      user.id,
      rating,
      sessionStorage.getItem("token")
    );
    if (response.status !== 200) {
      console.log("Error when rating.");
    }
    await fetchMachineQuestion();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.type;
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
      ];

      if (validTypes.includes(fileType)) {
        setImageFile(file);
        setImageFileName(file.name);
      } else {
        Swal.fire({
          icon: "error",
          title: "Invalid file type",
          text: "Please upload an image (PNG, JPG, GIF) or a PDF file.",
        });
        setImageFile(null);
        setImageFileName("");
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const query_ids = data.map((item) => item.user_id);
    const user_id = user.id;
    const response = await addSolution(
      user_id,
      question,
      userSolution,
      query_ids,
      imageFile,
      machine,
      sessionStorage.getItem("token")
    );

    if (response.status === 201) {
      console.log("Solution added successfully:", response);
      setUserSolution("");
      setImageFile(null);
      setImageFileName("");
      if (modalBodyRef.current) {
        modalBodyRef.current.scrollTop = 0;
      }
      fetchMachineQuestion();
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Your solution has been submitted.",
      });
    } else {
      console.error("Error adding solution:", response);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong. Please try again.",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMachineQuestion();
  }, [machine, question]);

  // Sorting based on likes and dislikes
  const sortedData = [...data].sort((a, b) => {
    const overallRatingA = a.likes - a.dislikes;
    const overallRatingB = b.likes - b.dislikes;
    return overallRatingB - overallRatingA;
  });

  // Function to format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd-MM-yyyy");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={() => closeModal()}
      ></div>
      <div className="bg-white p-6 rounded-lg shadow-lg z-10 w-3/4 h-3/4 flex flex-col relative">
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
        <div className="mt-4 overflow-y-auto h-full" ref={modalBodyRef}>
          {sortedData.map((item) => {
            const isLiked = item.liked_by.some((u) => u.id === user.id);
            const isDisliked = item.disliked_by.some((u) => u.id === user.id);
            return (
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
                    onClick={() => handleRatingClick("Like", item)}
                    className="bg-transparent hover:bg-green-100 p-1 rounded-full"
                    aria-label="Like"
                  >
                    {isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
                  </button>
                  <Tooltip
                    title={
                      item.liked_by.length > 0 ? (
                        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                          {item.liked_by.map((user) => (
                            <div key={user.id}>
                              {user.name} - {formatDate(user.created_at)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "There are no likes."
                      )
                    }
                    arrow
                    placement="top"
                  >
                    <span className="text-sm cursor-pointer">{item.likes}</span>
                  </Tooltip>
                  <div className="mr-4"></div>
                  <button
                    onClick={() => handleRatingClick("Dislike", item)}
                    className="bg-transparent hover:bg-red-100 p-1 rounded-full"
                    aria-label="Dislike"
                  >
                    {isDisliked ? <FaThumbsDown /> : <FaRegThumbsDown />}
                  </button>
                  <Tooltip
                    title={
                      item.disliked_by.length > 0 ? (
                        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                          {item.disliked_by.map((user) => (
                            <div key={user.id}>
                              {user.name} - {formatDate(user.created_at)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "There are no dislikes."
                      )
                    }
                    arrow
                    placement="top"
                  >
                    <span className="text-sm cursor-pointer">
                      {item.dislikes}
                    </span>
                  </Tooltip>
                </div>
              </div>
            );
          })}

          {/* USER ENTERED SOLUTION */}
          <h2 className="text-xl font-semibold mb-4 underline">Your Answer</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
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
                value={userSolution}
                onChange={(e) => setUserSolution(e.target.value)}
              />
            </div>
            <label
              htmlFor="cover-photo"
              className="block text-lg font-medium leading-6 text-gray-900 mt-4"
            >
              Solution Image (or PDF)
            </label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25">
              <div className="text-center">
                <PhotoIcon
                  aria-hidden="true"
                  className="mx-auto h-12 w-12 text-gray-300"
                />
                <div className="mt-4 flex flex-col text-sm leading-6 text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
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
                    <p className="mt-2 text-sm text-gray-600 truncate">
                      {imageFileName}
                    </p>
                  )}
                </div>
                <p className="text-xs leading-5 text-gray-600">
                  PNG, JPG, GIF, or PDF
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Solution"}
            </button>
          </form>
          {/* END OF USER ENTERED SOLUTION */}
        </div>
      </div>
    </div>
  );
}

export default QNAModal;
