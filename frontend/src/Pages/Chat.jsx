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

function Chat() {
  const [text, setText] = useState("");
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [localChats, setLocalChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isShowSidebar, setIsShowSidebar] = useState(false);
  const scrollToLastItem = useRef(null);

  const createNewChat = () => {
    setMessage(null);
    setText("");
    setCurrentTitle(null);
  };

  const backToHistoryPrompt = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setText("");
  };

  const toggleSidebar = useCallback(() => {
    setIsShowSidebar((prev) => !prev);
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    // return setErrorText(
    //   "The TSH intelligent Chatbot is currently down, please try again later."
    // );
    if (!text) return;

    setIsResponseLoading(true);
    setErrorText("");

    try {
      // TODO: to pass in the correct chatSessionId and userId
      const response = await sendMessageAPI("1", "1", text);
      if (response.status != 201) {
        setErrorText(response.data.message);
        setText("");
      } else {
        setErrorText("");
        const data = response.data;
        setMessage({
          role: "bot",
          content: data.response,
        });
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

  // get previous chats from local storage
  useEffect(() => {
    const storedChats = localStorage.getItem("previousChats");

    if (storedChats) {
      setLocalChats(JSON.parse(storedChats));
    }

    // TODO: if localChats is empty, fetch from the backend
  }, []);

  // update local storage with new chats
  useEffect(() => {
    if (!currentTitle && text && message) {
      setCurrentTitle(text);
    }

    if (currentTitle && text && message) {
      const newChat = {
        title: currentTitle,
        role: "user",
        content: text,
      };

      const responseMessage = {
        title: currentTitle,
        role: message.role,
        content: message.content,
      };

      setPreviousChats((prevChats) => [...prevChats, newChat, responseMessage]);
      setLocalChats((prevChats) => [...prevChats, newChat, responseMessage]);

      const updatedChats = [...localChats, newChat, responseMessage];
      localStorage.setItem("previousChats", JSON.stringify(updatedChats));
    }
  }, [message, currentTitle]);

  const currentChat = (localChats || previousChats).filter(
    (prevChat) => prevChat.title === currentTitle
  );

  const uniqueTitles = Array.from(
    new Set(previousChats.map((prevChat) => prevChat.title).reverse())
  );

  const localUniqueTitles = Array.from(
    new Set(localChats.map((prevChat) => prevChat.title).reverse())
  ).filter((title) => !uniqueTitles.includes(title));

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
            <button class="border-none bg-transparent cursor-pointer">
              New Question
            </button>
          </div>
          <div className="sidebar-history">
            {uniqueTitles.length > 0 && previousChats.length !== 0 && (
              <>
                <p>Ongoing</p>
                <ul>
                  {uniqueTitles?.map((uniqueTitle, idx) => {
                    const listItems = document.querySelectorAll("li");

                    listItems.forEach((item) => {
                      if (item.scrollWidth > item.clientWidth) {
                        item.classList.add("li-overflow-shadow");
                      }
                    });

                    return (
                      <li
                        key={idx}
                        onClick={() => backToHistoryPrompt(uniqueTitle)}
                      >
                        {uniqueTitle}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {localUniqueTitles.length > 0 && localChats.length !== 0 && (
              <>
                <p>Previous</p>
                <ul>
                  {localUniqueTitles?.map((uniqueTitle, idx) => {
                    const listItems = document.querySelectorAll("li");

                    listItems.forEach((item) => {
                      if (item.scrollWidth > item.clientWidth) {
                        item.classList.add("li-overflow-shadow");
                      }
                    });

                    return (
                      <li
                        key={idx}
                        onClick={() => backToHistoryPrompt(uniqueTitle)}
                      >
                        {uniqueTitle}
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
                const isUser = chatMsg.role === "user";

                return (
                  <li key={idx} ref={scrollToLastItem}>
                    {isUser ? (
                      <div>
                        <BiSolidUserCircle size={28.8} />
                      </div>
                    ) : (
                      <img src="images/tsh-logo.PNG" alt="ChatGPT" />
                    )}
                    {isUser ? (
                      <div>
                        <p className="role-title">You</p>
                        <p>{chatMsg.content}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="role-title">ChatGPT</p>
                        <p>{chatMsg.content}</p>
                      </div>
                    )}
                  </li>
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
