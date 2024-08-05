import React, { useState } from "react";
import SideNavBar from "../components/dashboard/SideNav";

const DashboardPage = () => {
  return (
    <div className="text-black bg-slate-300 min-w-screen min-h-screen grid grid-cols-8">
      <SideNavBar />
      <div className="col-span-7">hello from dashboard</div>
    </div>
  );
};

export default DashboardPage;
