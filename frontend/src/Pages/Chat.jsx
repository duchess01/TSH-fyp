import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { BiPlus, BiUser, BiSend, BiSolidUserCircle } from "react-icons/bi";
import { MdOutlineArrowLeft, MdOutlineArrowRight } from "react-icons/md";
import { sendMessageAPI } from "../api/chat";
import { getAllChatHistoryAPI } from "../api/chat";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user")); // fetching user details from session storage
    if (user === null) {
      // user not logged in or session expired. Redirect to login page
      navigate("/login");
    }
    console.log("User details: ", user);

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
  }, []);

  const newChatSessionId = (chats) => {
    const currHighestChatSessionId = Math.max(
      ...chats.map((chat) => chat.chat_session_id)
    );
    return currHighestChatSessionId + 1;
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
    setMessage(null);
    setText("");
    setCurrentTitle(null);
    setCurrentChat([]);
    console.log("this is new chat session id", newChatSessionId(previousChats));
    setChatSessionId(newChatSessionId(previousChats));
  };

  const backToHistoryPrompt = (uniqueTitle) => {
    setCurrentChat(previousChats.filter((chat) => chat.title === uniqueTitle));
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

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!text) return;

    setIsResponseLoading(true);
    setErrorText("");

    try {
      // TODO: to pass in the correct chatSessionId and userId
      const response = await sendMessageAPI(
        chatSessionId,
        currentUser.id,
        text
      );
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
        setCurrentChat((prev) => [
          ...prev,
          {
            message: text,
            response: data.response,
          },
        ]);
        setPreviousTitles(getUniqueTitles([...previousChats, data]));
        setCurrentTitle(data.title);
        setTimeout(() => {
          scrollToLastItem.current?.lastElementChild?.scrollIntoView({
            behavior: "smooth",
          });
        }, 1);
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
              <BiUser size={20} />
              <p>FAQs</p>
            </div>
            <div className="sidebar-info-user">
              <BiSolidUserCircle size={20} />
              <p>User</p>
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
                alt="ChatGPT"
              />
              <h1>TSH intelligent Chatbot</h1>
              <h3>How can I help you today?</h3>
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
              {currentChat?.map((chatMsg, idx) => {
                return (
                  <div key={idx} ref={scrollToLastItem}>
                    <li>
                      <div>
                        <div className="flex mb-1">
                          <BiSolidUserCircle size={28.8} />
                          <span className="role-title pl-2">You</span>
                        </div>
                        <p>{chatMsg.message}</p>
                      </div>
                    </li>
                    <li>
                      <div>
                        <div className="flex mb-1">
                          <img src="images/tsh-logo.PNG" alt="ChatGPT" />
                          <span className="role-title pl-2">ChatGPT</span>
                        </div>
                        <p>{chatMsg.response}</p>
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
