import React from 'react';
import Sidebar from "../components/admin/sidebar";
import Usertable from "../components/admin/users";

const AdminDashboard = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar /> {/* Sidebar on the left */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Usertable /> {/* Main content on the right */}
      </div>
    </div>
  );
};

export default AdminDashboard;