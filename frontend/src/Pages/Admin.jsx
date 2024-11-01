import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../components/admin/sidebar";
import Usertable from "../components/admin/users";
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuthorization = () => {
      const token = sessionStorage.getItem("token");
      let user;
      
      try {
        user = JSON.parse(sessionStorage.getItem("user"));
      } catch (error) {
        console.error("Error parsing user data:", error);
        return false;
      }

      // Check if token exists, user exists, and user has System Admin privilege
      if (!token || !user || !user.privileges) {
        return false;
      }

      return user.privileges.includes("System Admin");
    };

    const isUserAuthorized = checkAuthorization();

    if (!isUserAuthorized) {
      setNotification("Access denied. Only System Administrators can access this page.");
      setIsAuthorized(false);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  // Show loading state while checking authorization
  if (isAuthorized === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {notification && (
        <Alert variant="destructive" className="fixed top-0 left-0 right-0 z-50">
          <AlertDescription className="text-center">
            {notification}
          </AlertDescription>
        </Alert>
      )}
      {isAuthorized && (
        <>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Usertable />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;