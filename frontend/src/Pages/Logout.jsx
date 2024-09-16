import React, { useState, useEffect } from "react";

const LogoutPage = () => {
  useEffect(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  });

  return (
    <div className="text-black bg-slate-300 min-w-screen min-h-screen">
      You are logged out.
    </div>
  );
};

export default LogoutPage;
