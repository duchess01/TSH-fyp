import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  BiPlus,
  BiUser,
  BiSend,
  BiSolidUserCircle,
  BiLogOut,
} from "react-icons/bi";
import {
  MdOutlineArrowLeft,
  MdOutlineArrowRight,
  MdOutlineDashboard,
} from "react-icons/md";
import { AiOutlineMessage } from "react-icons/ai"; // New icon for QnA
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

function Chat() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({});
  const [text, setText] = useState("");
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [previousTitles, setPreviousTitles] = useState([]);
  const [currentChat, setCurrentChat] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isShowSidebar, setIsShowSidebar] = useState(false);
  const scrollToLastItem = useRef(null);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [thumbs, setThumbs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [manualMachineMapping, setManualMachineMapping] = useState([]);
  const [manualSelected, setManualSelected] = useState(null);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user")); // fetching user details from session storage
    if (user === null) {
      // user not logged in or session expired. Redirect to login page
      navigate("/login");
    }
    // console.log("User details: ", user);

    setCurrentUser(user);

    // fetching previous chats
    const fetchChats = async () => {
      try {
        const response = await getAllChatHistoryAPI(user.id);
        if (response.status === 200) {
          setPreviousChats(response.data);

          let newId = newChatSessionId(response.data);
          setChatSessionId(newId);

          const uniqueTitles = getUniqueTitles(response.data);
          setPreviousTitles(uniqueTitles);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchChats();

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
    const newChatId = currHighestChatSessionId + 1;
    return newChatId;
  };

  const getUniqueTitles = (chats) => {
    const uniqueTitles = chats.reduce((acc, curr) => {
      const exists = acc.find((item) => item.title === curr.title);
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

  const backToHistoryPrompt = (uniqueTitle) => {
    const currChat = previousChats.filter((chat) => chat.title === uniqueTitle);
    setCurrentChat(currChat);
    setSelectedMachine(currChat[0].machine);
    setChatSessionId(
      previousChats.find((chat) => chat.title === uniqueTitle).chat_session_id
    );
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
    setManualSelected(e.target.value);
    setPreviousTitles(getUniqueTitles([...previousChats, ""]));
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
        currentUser.id,
        text,
        manualSelected
      );
      // changing from a list of list in human_response to a list
      console.log("Response from chatbot: ", response);
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

  const handleThumbsChange = (input, currentRating, msgId) => {
    //allowed roles, to be confirmed
    const allowedRoles = ["admin", "supervisor", "manager"];
    const newRating = input === currentRating ? null : input;
    const updatedChat = currentChat.map((chat) =>
      chat.id === msgId ? { ...chat, rating: newRating } : chat
    );
    setCurrentChat(updatedChat);
    changeRating(msgId, newRating);
    if (
      allowedRoles.includes(currentUser.role) &&
      input === "down" &&
      currentRating !== "down"
    ) {
      setIsOpen(true);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* {isOpen === true ? <ChatModal closeModal={closeModal} /> : null} */}
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
                        className={currentTitle === ele.title ? "active" : ""}
                        key={idx}
                        onClick={() => backToHistoryPrompt(ele.title)}
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
                onChange={(e) => setSelectedMachine(e.target.value)}
              >
                <option>Select a machine</option>
                {machines.map((machine, idx) => {
                  return <option key={idx}>{machine}</option>;
                })}
              </select>
              <select
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
              </select>
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
                      Selected machine: {selectedMachine}, Selected manual:{" "}
                      {manualSelected}. Please ask a question.
                    </p>
                  </div>
                </li>
              )}
              {currentChat?.map((chatMsg, idx) => {
                const isLastMessage = idx === currentChat.length - 1;
                return (
                  <div key={idx} ref={isLastMessage ? scrollToLastItem : null}>
                    <li>
                      {chatMsg.message != "" ? (
                        <div>
                          <div className="flex mb-1">
                            <BiSolidUserCircle size={28.8} />
                            <span className="role-title pl-2">You</span>
                          </div>
                          <p>{chatMsg.message}</p>
                        </div>
                      ) : null}
                    </li>
                    <li>
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <div className="pt-2 w-full">
                            <p>
                              <span className="font-bold">
                                {isLastMessage && isResponseLoading
                                  ? ""
                                  : "LLM response:"}
                              </span>{" "}
                              <br /> {chatMsg.response}
                            </p>
                            <br />
                            <p>
                              <span className="font-bold">
                                {isLastMessage && isResponseLoading
                                  ? ""
                                  : "Human response:"}
                              </span>{" "}
                              <br />{" "}
                              {chatMsg.human_response &&
                                chatMsg.human_response.map((response, idx) => {
                                  return (
                                    <div
                                      key={idx}
                                      className="bg-slate-500 rounded mb-4 p-2"
                                    >
                                      <span className="font-bold">
                                        Solution {idx + 1}:
                                      </span>{" "}
                                      <br /> {response.solution}
                                      <p className="flex justify-end">
                                        <span className="font-bold">
                                          Likes:
                                        </span>{" "}
                                        {response.likes}{" "}
                                        <span className="ml-4 font-bold">
                                          Dislikes:
                                        </span>{" "}
                                        {response.dislikes}
                                      </p>
                                    </div>
                                  );
                                })}
                            </p>
                          </div>
                          {!isResponseLoading && (
                            <div className="flex item-start space-x-2 pl-2">
                              <button
                                onClick={() =>
                                  handleThumbsChange(
                                    "up",
                                    chatMsg.rating,
                                    chatMsg.id
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
                                    chatMsg.id
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
                        {isResponseLoading && isLastMessage ? (
                          <div className="flex items-center justify-center">
                            <FaSpinner
                              className="animate-spin"
                              style={{ position: "relative", top: "-30px" }}
                            />
                          </div>
                        ) : (
                          <></>
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
