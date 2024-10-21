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
import { BiSolidUserCircle, BiChat } from "react-icons/bi";
import { MdOutlineArrowLeft, MdOutlineArrowRight } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import QNAModal from "../components/chat/QNAModal";
import PostQuestionModal from "../components/chat/PostQuestionModal";
import { unique } from "../api/qna";

const QnA = () => {
  const navigate = useNavigate();

  const [modelOpen, setModelOpen] = useState(false);
  const [postQuestionModalOpen, setPostQuestionModalOpen] = useState(false);
  const [isShowSidebar, setIsShowSidebar] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null); // State to hold the selected row data

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
  const [rowData, setRowData] = useState([]);

  const colDefs = useMemo(
    () => [
      {
        field: "Machine",
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

  const closeModal = () => {
    setModelOpen(false);
  };

  const closePostQuestionModal = () => {
    setPostQuestionModalOpen(false);
  };

  useEffect(() => {
    const fetchUniqueQnA = async () => {
      const response = await unique();
      if (response && response.data) {
        const transformedData = response.data.map((item) => ({
          Machine: item.machine,
          Question: item.question,
          Answers: parseInt(item.count),
          Last_Updated: new Date(item.latest_date).toLocaleDateString("en-GB"),
        }));
        setRowData(transformedData);
      }
    };
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
            <button className="border-none bg-transparent cursor-pointer">
              Post Question
            </button>
          </div>
          <div className="sidebar-info">
            <div className="sidebar-info-upgrade" onClick={() => navigate("/")}>
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
