import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { BiPlus, BiSend, BiSolidUserCircle, BiLogOut } from "react-icons/bi";
import {
  MdOutlineArrowLeft,
  MdOutlineArrowRight,
  MdOutlineDashboard,
} from "react-icons/md";
import { AiOutlineMessage } from "react-icons/ai";
import { FaSpinner } from "react-icons/fa";
import { changeRating, sendMessageAPI } from "../api/chat";
import { getAllChatHistoryAPI, getAllMachinesAPI } from "../api/chat";
import { useNavigate } from "react-router-dom";
import {
  FaRegThumbsDown,
  FaRegThumbsUp,
  FaThumbsDown,
  FaThumbsUp,
} from "react-icons/fa";
import { addSolution, rate } from "../api/qna";
import { Tooltip } from "@mui/material";
import { format } from "date-fns";

function Chat() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({});
  const [text, setText] = useState("");
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [previousTitles, setPreviousTitles] = useState([{}]);
  const [currentChat, setCurrentChat] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isShowSidebar, setIsShowSidebar] = useState(false);
  const scrollToLastItem = useRef(null);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [manualMachineMapping, setManualMachineMapping] = useState([]);
  const [manualSelected, setManualSelected] = useState(null);

  const fetchChats = async (user_Id) => {
    try {
      const response = await getAllChatHistoryAPI(
        user_Id,
        sessionStorage.getItem("token")
      );
      if (response.status === 200) {
        await setPreviousChats(response.data);

        let newId = newChatSessionId(response.data);
        setChatSessionId(newId);

        const uniqueTitles = getUniqueTitles(response.data);
        setPreviousTitles(uniqueTitles);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user")); // fetching user details from session storage
    if (user === null) {
      // user not logged in or session expired. Redirect to login page
      navigate("/login");
    }
    setCurrentUser(user);

    // fetching previous chats
    fetchChats(user.id);

    const fetchMachines = async () => {
      try {
        const response = await getAllMachinesAPI();
        if (response.status === 200) {
          const machines = response.data.data.map(
            (machine) => machine.machine_name
          );
          setManualMachineMapping(response.data.data);
          setMachines(machines);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchMachines();
  }, []);

  const newChatSessionId = (chats) => {
    let currHighestChatSessionId = 0;
    chats.forEach((chat) => {
      if (chat.chat_session_id > currHighestChatSessionId) {
        currHighestChatSessionId = chat.chat_session_id;
      }
    });
    currHighestChatSessionId = Number(currHighestChatSessionId);
    const newChatId = currHighestChatSessionId + 1;
    return newChatId;
  };

  const getUniqueTitles = (chats) => {
    const uniqueTitles = chats.reduce((acc, curr) => {
      const exists = acc.find(
        (item) =>
          item.title === curr.title &&
          item.chat_session_id === curr.chat_session_id
      );
      if (!exists) {
        acc.push({
          title: curr.title,
          chat_session_id: curr.chat_session_id,
        });
      }
      return acc;
    }, []);
    return uniqueTitles;
  };

  const createNewChat = () => {
    setSelectedMachine(null);
    setMessage(null);
    setText("");
    setCurrentTitle(null);
    setCurrentChat([]);
    setChatSessionId(newChatSessionId(previousChats));
    setSelectedMachine(null);
  };

  const backToHistoryPrompt = (uniqueTitle, id) => {
    const currChat = previousChats.filter(
      (chat) => chat.title == uniqueTitle && chat.chat_session_id == id
    );

    setCurrentChat(currChat);
    setManualSelected(currChat[0].machine);
    setChatSessionId(id);
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setText("");
    setTimeout(() => {
      scrollToLastItem.current?.lastElementChild?.scrollIntoView({
        behavior: "smooth",
      });
    }, 1);
  };

  const toggleSidebar = useCallback(() => {
    setIsShowSidebar((prev) => !prev);
  }, []);

  const handleManualSelect = (e) => {
    setPreviousTitles(
      getUniqueTitles([...previousChats, { title: "", id: chatSessionId }])
    );
    setCurrentTitle(e.target.value);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollToLastItem.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 1);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!text) return;

    setIsResponseLoading(true);
    setErrorText("");
    setCurrentChat((prev) => [
      ...prev,
      {
        message: text,
      },
    ]);
    scrollToBottom();

    try {
      const response = await sendMessageAPI(
        chatSessionId,
        String(currentUser.id),
        text,
        manualSelected,
        sessionStorage.getItem("token")
      );
      // changing from a list of list in human_response to a list
      response.data.human_response = response.data.human_response.flat();
      if (response.status != 201) {
        setErrorText(response.data.message);
        setText("");
        // return setErrorText(
        //   "The TSH intelligent Chatbot is currently down, please try again later."
        // );
      } else {
        setErrorText("");
        const data = response.data;
        setPreviousChats((prev) => [...prev, data]);
        // updating the lastest msg in prev to response from chatbot
        setCurrentChat((prev) => [
          ...prev.slice(0, prev.length - 1),
          {
            message: text,
            response: data.response,
            human_response: data.human_response,
          },
        ]);
        setPreviousTitles(getUniqueTitles([...previousChats, data]));
        setCurrentTitle(data.title);
        scrollToBottom();
        setTimeout(() => {
          setText("");
        }, 2);
      }
    } catch (e) {
      setErrorText(e.message);
      console.error(e);
    } finally {
      setIsResponseLoading(false);
    }
  };

  useLayoutEffect(() => {
    const handleResize = () => {
      setIsShowSidebar(window.innerWidth <= 640);
    };
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleThumbsChange = async (
    input,
    currentRating,
    msgId,
    manual,
    question,
    solution
  ) => {
    //allowed roles, to be confirmed
    const allowedRoles = ["Admin", "supervisor", "manager"];
    const newRating = input === currentRating ? null : input;
    const updatedChat = currentChat.map((chat) =>
      chat.id === msgId ? { ...chat, rating: newRating } : chat
    );
    const machine = manualMachineMapping.find((machine) =>
      machine.manual_names.includes(manual)
    );
    setCurrentChat(updatedChat);
    changeRating(msgId, newRating);
    if (
      allowedRoles.includes(currentUser.role) &&
      input === "down" &&
      currentRating !== "down"
    ) {
      try {
        const response = await addSolution(
          null,
          msgId,
          question,
          solution,
          [],
          null,
          machine.machine_name,
          sessionStorage.getItem("token"),
          ""
        );
      } catch (error) {
        console.error("Error while adding to QnA: ", error);
      }
    }
  };

  const handleRatingClick = async (type, item) => {
    const isLiked = item.liked_by.some((u) => u.id === currentUser.id);
    const isDisliked = item.disliked_by.some((u) => u.id === currentUser.id);

    // Convert likes and dislikes to numbers in case they are stored as strings
    let likes = parseInt(item.likes, 10) || 0;
    let dislikes = parseInt(item.dislikes, 10) || 0;

    let rating;

    // Handle optimistic update for like/dislike
    if (type === "Like") {
      // Toggle like status
      rating = isLiked ? null : true;

      // Optimistically update likes/dislikes immediately
      likes = isLiked ? likes - 1 : likes + 1;
      item.likes = likes;
      item.liked_by = isLiked
        ? item.liked_by.filter((u) => u.id !== currentUser.id) // Remove user if already liked
        : [...item.liked_by, currentUser]; // Add user if not already liked

      // If the user was previously disliked, remove the dislike
      if (isDisliked) {
        dislikes -= 1;
        item.dislikes = dislikes;
        item.disliked_by = item.disliked_by.filter(
          (u) => u.id !== currentUser.id
        );
      }
    } else if (type === "Dislike") {
      // Toggle dislike status
      rating = isDisliked ? null : false;

      // Optimistically update likes/dislikes immediately
      dislikes = isDisliked ? dislikes - 1 : dislikes + 1;
      item.dislikes = dislikes;
      item.disliked_by = isDisliked
        ? item.disliked_by.filter((u) => u.id !== currentUser.id) // Remove user if already disliked
        : [...item.disliked_by, currentUser]; // Add user if not already disliked

      // If the user was previously liked, remove the like
      if (isLiked) {
        likes -= 1;
        item.likes = likes;
        item.liked_by = item.liked_by.filter((u) => u.id !== currentUser.id);
      }
    }

    // Optimistically update the currentChat state
    setCurrentChat((prevChat) =>
      prevChat.map((chatItem) =>
        chatItem.id === item.id ? { ...chatItem, ...item } : chatItem
      )
    );

    try {
      // Send the rating update to the backend
      const response = await rate(
        item.id,
        currentUser.id,
        rating,
        sessionStorage.getItem("token")
      );
    } catch (error) {
      console.error("Error while rating QnA: ", error);

      // If the backend request fails, rollback the optimistic UI changes
      if (type === "Like") {
        likes = isLiked ? likes + 1 : likes - 1;
        item.likes = likes;
        item.liked_by = isLiked
          ? [...item.liked_by, currentUser]
          : item.liked_by.filter((u) => u.id !== currentUser.id);

        if (isDisliked) {
          dislikes += 1;
          item.dislikes = dislikes;
          item.disliked_by = [...item.disliked_by, currentUser];
        }
      } else if (type === "Dislike") {
        dislikes = isDisliked ? dislikes + 1 : dislikes - 1;
        item.dislikes = dislikes;
        item.disliked_by = isDisliked
          ? [...item.disliked_by, currentUser]
          : item.disliked_by.filter((u) => u.id !== currentUser.id);

        if (isLiked) {
          likes += 1;
          item.likes = likes;
          item.liked_by = [...item.liked_by, currentUser];
        }
      }

      // Rollback optimistic update in state
      setCurrentChat((prevChat) =>
        prevChat.map((chatItem) =>
          chatItem.id === item.id ? { ...chatItem, ...item } : chatItem
        )
      );
    }
  };

  const formatDate = (dateString) => {
    if (dateString) {
      return format(new Date(dateString), "dd-MM-yyyy");
    }
    return format(new Date(), "dd-MM-yyyy");
  };

  return (
    <>
      <div
        className="min-w-full chat h-screen"
        style={{
          color: "#ececf1",
          display: "grid",
          gridTemplateColumns: "0fr 1fr",
          backgroundColor: "#343541",
        }}
      >
        <section className={`sidebar ${isShowSidebar ? "open" : ""}`}>
          <div className="sidebar-header" onClick={createNewChat} role="button">
            <BiPlus size={20} />
            <button className="border-none bg-transparent cursor-pointer">
              New Question
            </button>
          </div>
          <div className="sidebar-history">
            {previousTitles.length !== 0 && (
              <>
                <ul>
                  {previousTitles?.map((ele, idx) => {
                    const listItems = document.querySelectorAll("li");

                    listItems.forEach((item) => {
                      if (item.scrollWidth > item.clientWidth) {
                        item.classList.add("li-overflow-shadow");
                      }
                    });

                    return (
                      <li
                        className={
                          currentTitle == ele.title &&
                          chatSessionId == ele.chat_session_id
                            ? "active"
                            : ""
                        }
                        key={idx}
                        onClick={() =>
                          backToHistoryPrompt(ele.title, ele.chat_session_id)
                        }
                      >
                        {ele.title}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
          <div className="sidebar-info">
            <div className="sidebar-info-upgrade">
              <button
                className="flex items-center border-none bg-transparent cursor-pointer w-full p-2 hover:bg-gray-700"
                onClick={() => navigate("/qna")}
              >
                <AiOutlineMessage size={20} />
                <span className="pl-2">QnA</span>
              </button>
            </div>
            <div className="sidebar-info-upgrade">
              <button
                className="flex items-center border-none bg-transparent cursor-pointer w-full p-2 hover:bg-gray-700"
                onClick={() => navigate("/dashboard")}
              >
                <MdOutlineDashboard size={20} />
                <span className="pl-2">Dashboard</span>
              </button>
            </div>
            <div className="sidebar-info-upgrade">
              <button
                className="flex items-center border-none bg-transparent cursor-pointer w-full p-2 hover:bg-gray-700"
                onClick={() => navigate("/admin")}
              >
                <BiSolidUserCircle size={20} />
                <span className="pl-2">Admin</span>
              </button>
            </div>
            <div className="sidebar-info-upgrade">
              <button
                className="flex items-center border-none bg-transparent cursor-pointer w-full p-2 hover:bg-gray-700"
                onClick={() => {
                  sessionStorage.clear();
                  navigate("/logout");
                }}
              >
                <BiLogOut size={20} />
                <span className="pl-2">Logout</span>
              </button>
            </div>
          </div>
        </section>

        <section className="main">
          {!currentTitle && (
            <div className="empty-chat-container">
              <img
                src="images/tsh-logo.PNG"
                width={45}
                height={45}
                alt="TshGPT"
              />
              <h1>TSH intelligent Chatbot</h1>
              <h3>Choose a machine from the dropdown below to start</h3>
              <select
                className="p-1 rounded-lg text-black"
                onChange={(e) => {
                  setSelectedMachine(e.target.value);
                  setManualSelected(
                    manualMachineMapping.filter(
                      (machine) => machine.machine_name === e.target.value
                    )[0].manual_names[0]
                  );
                  handleManualSelect(e);
                }}
              >
                <option>Select a machine</option>
                {machines.map((machine, idx) => {
                  return <option key={idx}>{machine}</option>;
                })}
              </select>
              {/* <select
                className="p-1 rounded-lg text-black"
                onChange={handleManualSelect}
              >
                <option>Select a manual</option>
                {selectedMachine &&
                  manualMachineMapping
                    .filter(
                      (machine) => machine.machine_name === selectedMachine
                    )[0]
                    .manual_names.map((manual, idx) => {
                      return <option key={idx}>{manual}</option>;
                    })}
              </select> */}
            </div>
          )}

          {isShowSidebar ? (
            <MdOutlineArrowRight
              className="burger"
              size={28.8}
              onClick={toggleSidebar}
            />
          ) : (
            <MdOutlineArrowLeft
              className="burger"
              size={28.8}
              onClick={toggleSidebar}
            />
          )}
          <div className="main-header">
            <ul>
              {selectedMachine != null && manualSelected != null && (
                <li>
                  <div>
                    <div className="flex mb-1">
                      <img src="images/tsh-logo.PNG" alt="TshGPT" />
                      <span className="role-title pl-2">TSH GPT</span>
                    </div>
                    <p>
                      Selected machine: {selectedMachine}. Please ask a
                      question.
                    </p>
                  </div>
                </li>
              )}
              {currentChat?.map((chatMsg, idx) => {
                const isLastMessage = idx === currentChat.length - 1;
                return (
                  <div key={idx} ref={isLastMessage ? scrollToLastItem : null}>
                    <li>
                      {chatMsg.message !== "" && (
                        <div>
                          <div className="flex mb-1">
                            <BiSolidUserCircle size={28.8} />
                            <span className="role-title pl-2">You</span>
                          </div>
                          <p>{chatMsg.message}</p>
                        </div>
                      )}
                    </li>
                    <li>
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">
                            {isLastMessage && isResponseLoading
                              ? ""
                              : "LLM response:"}
                          </span>
                          {/* Thumbs icons container */}
                          {!isResponseLoading && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  handleThumbsChange(
                                    "up",
                                    chatMsg.rating,
                                    chatMsg.id,
                                    chatMsg.machine,
                                    chatMsg
                                  )
                                }
                                className="focus:outline-none"
                              >
                                {chatMsg.rating === "up" ? (
                                  <FaThumbsUp />
                                ) : (
                                  <FaRegThumbsUp />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  handleThumbsChange(
                                    "down",
                                    chatMsg.rating,
                                    chatMsg.id,
                                    chatMsg.machine,
                                    chatMsg.message,
                                    chatMsg.response
                                  )
                                }
                                className="focus:outline-none"
                              >
                                {chatMsg.rating === "down" ? (
                                  <FaThumbsDown />
                                ) : (
                                  <FaRegThumbsDown />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                        {/* New line for the actual response */}
                        <p className="mt-1">{chatMsg.response}</p>
                        {isResponseLoading && isLastMessage ? (
                          <div className="flex items-center justify-center">
                            <FaSpinner
                              className="animate-spin"
                              style={{ fontSize: "24px" }}
                            />
                          </div>
                        ) : (
                          <>
                            {chatMsg.human_response &&
                              chatMsg.human_response.some(
                                (response) => response !== null
                              ) && (
                                <p className="mt-4">
                                  {/* Conditionally render "Human response:" text only if there are valid responses */}
                                  {chatMsg.human_response &&
                                  chatMsg.human_response.some(
                                    (response) => response !== null
                                  ) ? (
                                    <span className="font-bold">
                                      {isLastMessage && isResponseLoading
                                        ? ""
                                        : "Human response:"}
                                    </span>
                                  ) : null}

                                  <br />

                                  {/* Render human responses only if valid responses exist */}
                                  {chatMsg.human_response &&
                                    chatMsg.human_response
                                      .filter((response) => response !== null) // Remove null values
                                      .map((response, idx) => {
                                        const isLiked = response.liked_by.some(
                                          (u) => u.id === currentUser.id
                                        );
                                        const isDisliked =
                                          response.disliked_by.some(
                                            (u) => u.id === currentUser.id
                                          );

                                        return (
                                          <div
                                            key={idx}
                                            className="bg-slate-500 rounded mb-4 p-2"
                                          >
                                            <div className="flex justify-between items-center">
                                              <span className="font-bold">
                                                Solution {idx + 1}:
                                              </span>
                                              <div className="flex items-center">
                                                {/* Like Button */}
                                                <button
                                                  onClick={() =>
                                                    handleRatingClick(
                                                      "Like",
                                                      response
                                                    )
                                                  }
                                                  className="bg-transparent hover:bg-green-900 p-1 rounded-full"
                                                  aria-label="Like"
                                                >
                                                  {isLiked ? (
                                                    <FaThumbsUp />
                                                  ) : (
                                                    <FaRegThumbsUp />
                                                  )}
                                                </button>
                                                <Tooltip
                                                  title={
                                                    response.likes > 0 ? (
                                                      <div
                                                        style={{
                                                          maxHeight: "200px",
                                                          overflowY: "auto",
                                                        }}
                                                      >
                                                        {response.liked_by.map(
                                                          (user) => (
                                                            <div key={user.id}>
                                                              {user.name} -{" "}
                                                              {formatDate(
                                                                user.created_at
                                                              )}
                                                            </div>
                                                          )
                                                        )}
                                                        {response.likes >
                                                          response.liked_by
                                                            .length &&
                                                          Array.from(
                                                            {
                                                              length:
                                                                response.likes -
                                                                response
                                                                  .liked_by
                                                                  .length,
                                                            },
                                                            (_, index) => (
                                                              <div
                                                                key={`deleted-like-${index}`}
                                                              >
                                                                Deleted User
                                                              </div>
                                                            )
                                                          )}
                                                      </div>
                                                    ) : (
                                                      "There are no likes."
                                                    )
                                                  }
                                                  arrow
                                                  placement="top"
                                                >
                                                  <span className="text-sm cursor-pointer">
                                                    {response.likes}
                                                  </span>
                                                </Tooltip>

                                                <div className="mr-4"></div>

                                                {/* Dislike Button */}
                                                <button
                                                  onClick={() =>
                                                    handleRatingClick(
                                                      "Dislike",
                                                      response
                                                    )
                                                  }
                                                  className="bg-transparent hover:bg-red-900 p-1 rounded-full"
                                                  aria-label="Dislike"
                                                >
                                                  {isDisliked ? (
                                                    <FaThumbsDown />
                                                  ) : (
                                                    <FaRegThumbsDown />
                                                  )}
                                                </button>
                                                <Tooltip
                                                  title={
                                                    response.dislikes > 0 ? (
                                                      <div
                                                        style={{
                                                          maxHeight: "200px",
                                                          overflowY: "auto",
                                                        }}
                                                      >
                                                        {response.disliked_by.map(
                                                          (user) => (
                                                            <div key={user.id}>
                                                              {user.name} -{" "}
                                                              {formatDate(
                                                                user.created_at
                                                              )}
                                                            </div>
                                                          )
                                                        )}
                                                        {response.dislikes >
                                                          response.disliked_by
                                                            .length &&
                                                          Array.from(
                                                            {
                                                              length:
                                                                response.dislikes -
                                                                response
                                                                  .disliked_by
                                                                  .length,
                                                            },
                                                            (_, index) => (
                                                              <div
                                                                key={`deleted-dislike-${index}`}
                                                              >
                                                                Deleted User
                                                              </div>
                                                            )
                                                          )}
                                                      </div>
                                                    ) : (
                                                      "There are no dislikes."
                                                    )
                                                  }
                                                  arrow
                                                  placement="top"
                                                >
                                                  <span className="text-sm cursor-pointer">
                                                    {response.dislikes}
                                                  </span>
                                                </Tooltip>
                                              </div>
                                            </div>

                                            <br />
                                            {response.solution}
                                            {response.solution_image && (
                                              <div className="mt-2">
                                                <a
                                                  href={URL.createObjectURL(
                                                    new Blob(
                                                      [
                                                        new Uint8Array(
                                                          response.solution_image.data
                                                        ),
                                                      ],
                                                      {
                                                        type:
                                                          response.solution_image_type ||
                                                          "application/octet-stream",
                                                      }
                                                    )
                                                  )}
                                                  download={`Attachment.${response.solution_image_type === "image/png" ? "png" : response.solution_image_type === "image/jpeg" ? "jpg" : response.solution_image_type === "application/pdf" ? "pdf" : "bin"}`}
                                                  className="text-blue-500 underline"
                                                  aria-label="Download attachment"
                                                >
                                                  Attachment
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                </p>
                              )}
                          </>
                        )}
                      </div>
                    </li>
                  </div>
                );
              })}
            </ul>
          </div>
          <div className="main-bottom">
            {errorText && <p className="errorText">{errorText}</p>}
            {errorText && <p id="errorTextHint"></p>}
            <form className="form-container" onSubmit={submitHandler}>
              <input
                type="text"
                placeholder="Ask a question."
                spellCheck="false"
                value={isResponseLoading ? "Processing..." : text}
                onChange={(e) => setText(e.target.value)}
                readOnly={isResponseLoading}
              />
              {!isResponseLoading && (
                <button type="submit">
                  <BiSend size={20} />
                </button>
              )}
            </form>
            <p>
              TSH intelligent chatbot can make mistakes. Consider checking
              important information.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

export default Chat;
