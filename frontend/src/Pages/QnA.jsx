import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  useState,
  useRef,
  useMemo,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "react";
import { BiSolidUserCircle, BiLogOut, BiChat, BiPlus } from "react-icons/bi";
import {
  MdOutlineArrowLeft,
  MdOutlineArrowRight,
  MdOutlineDashboard,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import QNAModal from "../components/chat/QNAModal";
import PostQuestionModal from "../components/chat/PostQuestionModal";
import { unique } from "../api/qna";

const QnA = () => {
  const navigate = useNavigate();
  const [modelOpen, setModelOpen] = useState(false);
  const [postQuestionModalOpen, setPostQuestionModalOpen] = useState(false);
  const [isShowSidebar, setIsShowSidebar] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [rowData, setRowData] = useState([]);

  const toggleSidebar = useCallback(() => {
    setIsShowSidebar((prev) => !prev);
  }, []);

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

  const gridRef = useRef();

  const colDefs = useMemo(
    () => [
      {
        field: "Machine",
        filter: "agTextColumnFilter",
        flex: 2,
      },
      {
        field: "Topic",
        filter: "agTextColumnFilter",
        flex: 2,
      },
      {
        field: "Question",
        filter: "agTextColumnFilter",
      },
      {
        field: "Answers",
        filter: "agNumberColumnFilter",
        flex: 1,
      },
      {
        headerName: "Last Updated",
        valueGetter: (p) => p.data.Last_Updated,
        filter: "agDateColumnFilter",
        flex: 1,
      },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      filterParams: {
        debounceMs: 0,
      },
      floatingFilter: true,
      flex: 5,
    }),
    []
  );

  // Fetch unique QnA function
  const fetchUniqueQnA = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found in sessionStorage");
      return;
    }
    const response = await unique(token);
    if (response && response.data) {
      const transformedData = response.data.map((item) => ({
        Machine: item.machine,
        Question: item.question,
        Answers: parseInt(item.count),
        Last_Updated: new Date(item.latest_date).toLocaleDateString("en-GB"),
        Topic: item.topic,
      }));
      setRowData(transformedData);
    }
  };

  const closeModal = () => {
    setModelOpen(false);
    fetchUniqueQnA();
  };

  const closePostQuestionModal = () => {
    setPostQuestionModalOpen(false);
    fetchUniqueQnA();
  };

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user")); // fetching user details from session storage
    if (user === null) {
      // user not logged in or session expired. Redirect to login page
      navigate("/login");
    }
    fetchUniqueQnA();
  }, []);

  const handleRowClick = (row) => {
    setSelectedRowData(row.data);
    setModelOpen(true);
  };

  return (
    <>
      {modelOpen && (
        <QNAModal
          closeModal={closeModal}
          machine={selectedRowData?.Machine}
          question={selectedRowData?.Question}
        />
      )}
      {postQuestionModalOpen && (
        <PostQuestionModal closeModal={closePostQuestionModal} />
      )}
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
          <div
            className="sidebar-header"
            role="button"
            onClick={() => setPostQuestionModalOpen(true)}
          >
            <BiPlus size={20} />
            <button className="border-none bg-transparent cursor-pointer">
              Post Question
            </button>
          </div>
          <div className="sidebar-info">
            <div className="sidebar-info-upgrade">
              <button
                className="flex items-center border-none bg-transparent cursor-pointer w-full p-2 hover:bg-gray-700"
                onClick={() => navigate("/")}
              >
                <BiChat size={20} />
                <span className="pl-2">Chatbot</span>
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
          <div className="empty-chat-container">
            <div
              className="ag-theme-alpine-dark"
              style={{ height: "95vh", width: "80vw" }}
            >
              <AgGridReact
                pagination={true}
                paginationPageSize={20}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                ref={gridRef}
                rowData={rowData}
                animateRows={true}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                onRowClicked={handleRowClick}
              />
            </div>
          </div>
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
        </section>
      </div>
    </>
  );
};

export default QnA;
