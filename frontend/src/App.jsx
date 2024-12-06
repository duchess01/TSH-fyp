import "./styles/index.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Chat from "./Pages/Chat";
import LoginPage from "./Pages/Login";
import DashboardPage from "./Pages/Dashboard";
import LogoutPage from "./Pages/Logout";
import AdminPage from "./Pages/Admin";
import UploadPage from "./Pages/manualupload";
import "./styles/tailwind.css";
import QnA from "./Pages/QnA";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/Logout" element={<LogoutPage />} />
          <Route path="/Admin" element={<AdminPage />} />
          <Route path="/qna" element={<QnA />} />
          <Route path="/Upload" element={<UploadPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
