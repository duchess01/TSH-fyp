import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../components/admin/sidebar";
import Usertable from "../components/admin/users";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(null); // State to track authorization

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (!token || !user || user.privilege !== 'System Admin') {
      // If unauthorized, set notification and schedule redirect
      setNotification("You do not have access to the Admin Dashboard. Redirecting to login...");
      setIsAuthorized(false);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/login"); // Redirect to login page
      }, 3000);
    } else {
      // If authorized, show the admin page
      setIsAuthorized(true);
    }
  }, [navigate]);

  if (isAuthorized === null) {
    // While authorization is being checked, show a blank page
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {notification && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 text-center">
          {notification}
        </div>
      )}
      {isAuthorized && (
        <>
          <Sidebar /> {/* Sidebar on the left */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Usertable /> {/* Main content on the right */}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
