import React from 'react';
import Sidebar from "../components/admin/sidebar";
import Usertable from "../components/admin/users";; 

const AdminDashboard = () => {
  return (
    <div className="flex">
      <Sidebar /> {/* Sidebar on the left */}
      <div className="flex-1 p-6">
        <Usertable /> {/* Main content on the right */}
      </div>
    </div>
  );
};

export default AdminDashboard;