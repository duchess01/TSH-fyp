import "./styles/index.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Chat from "./Pages/Chat";
import LoginPage from "./Pages/Login";
import DashboardPage from "./Pages/Dashboard";
import AdduserPage from "./Pages/Adduser";
import AdminPage from "./Pages/Admin";


import "./styles/tailwind.css";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/Adduser" element={<AdduserPage />} />
          <Route path="/Admin" element={<AdminPage />} />
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
