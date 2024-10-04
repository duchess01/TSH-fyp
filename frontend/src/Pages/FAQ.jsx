import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useState, useRef, useMemo, useLayoutEffect, useCallback } from "react";
import {
  BiPlus,
  BiUser,
  BiSend,
  BiSolidUserCircle,
  BiChat,
} from "react-icons/bi";
import { MdOutlineArrowLeft, MdOutlineArrowRight } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import QNAModal from "../components/chat/QNAModal";
import PostQuestionModal from "../components/chat/PostQuestionModal";

const FAQ = () => {
  const navigate = useNavigate();

  const [modelOpen, setModelOpen] = useState(false);
  const [postQuestionModalOpen, setPostQuestionModalOpen] = useState(false);

  const [isShowSidebar, setIsShowSidebar] = useState(false);
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
  const [rowData, setRowData] = useState([
    {
      Machine: "Machine X",
      Question: "What to do error code 300?",
      Solution: 64950,
      Answers: 1,
      Last_Updated: "24 / 11 / 2024",
    },
    {
      Machine: "Machine Y",
      Question: "What to do error code 500?",
      Solution: 64950,
      Answers: 2,
      Last_Updated: "24 / 11 / 2024",
    },
    {
      Machine: "Machine Z",
      Question: "What to do error code 700?",
      Solution: 64950,
      Answers: 3,
      Last_Updated: "24 / 11 / 2024",
    },
    {
      Machine: "Machine A",
      Question: "What to do error code 700?",
      Solution: 64950,
      Answers: 3,
      Last_Updated: "24 / 11 / 2024",
    },
    {
      Machine: "Machine B",
      Question: "What to do error code 700?",
      Solution: 64950,
      Answers: 3,
      Last_Updated: "24 / 11 / 2024",
    },
    {
      Machine: "Machine C",
      Question: "What to do error code 700?",
      Solution: 64950,
      Answers: 3,
      Last_Updated: "24 / 11 / 2024",
    },
    {
      Machine: "Machine D",
      Question: "What to do error code 700?",
      Solution: 64950,
      Answers: 3,
      Last_Updated: "24 / 11 / 2024",
    },
    {
      Machine: "Machine E",
      Question: "What to do error code 700?",
      Solution: 64950,
      Answers: 3,
      Last_Updated: "24 / 11 / 2024",
    },
  ]);

  const [colDefs, setColDefs] = useState([
    {
      field: "Machine",
      filter: "agTextColumnFilter",
      flex: 2,
    },
    {
      field: "Question",
      filter: "agTextColumnFilter",
    },
    // { field: "Solution" },
    {
      field: "Answers",
      filter: "agNumberColumnFilter",
      flex: 1,
      // cellStyle: { "text-align": "center" },
    },
    {
      headerName: "Last Updated",
      valueGetter: (p) => p.data.Last_Updated,
      filter: "agDateColumnFilter",
      flex: 1,
    },
  ]);

  const defaultColDef = useMemo(
    () => ({
      filterParams: {
        debounceMs: 0,
        // buttons: ["apply", "reset"],
      },
      floatingFilter: true,
      flex: 5,
    }),
    []
  );

  const closeModal = () => {
    setModelOpen(false);
  };

  const closePostQuestionModal = () => {
    setPostQuestionModalOpen(false);
  };

  return (
    <>
      {modelOpen == true ? <QNAModal closeModal={closeModal} /> : null}
      {postQuestionModalOpen == true ? (
        <PostQuestionModal closeModal={closePostQuestionModal} />
      ) : null}
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
            onClick={() => {
              setPostQuestionModalOpen(true);
            }}
          >
            <button className="border-none bg-transparent cursor-pointer">
              Post Question
            </button>
          </div>
          <div className="sidebar-history"></div>
          <div className="sidebar-info">
            <div
              className="sidebar-info-upgrade"
              onClick={() => {
                navigate("/");
              }}
            >
              <BiChat size={20} />
              <p>ChatBot</p>
            </div>
            <div className="sidebar-info-user">
              <BiSolidUserCircle size={20} />
              <p>User</p>
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
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                ref={gridRef}
                rowData={rowData}
                animateRows={true}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                onRowClicked={() => setModelOpen(true)}
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
          <div className="main-header"></div>
        </section>
      </div>
    </>
  );
};
export default FAQ;
