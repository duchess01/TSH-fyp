import "./styles/index.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Chat from "./Pages/Chat";
import LoginPage from "./Pages/Login";
import DashboardPage from "./Pages/Dashboard";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
