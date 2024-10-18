import React from 'react';
import Sidebar from "../components/admin/sidebar";
import Manual from "../components/manual/manual";

const ManualUploadPage = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto bg-gray-100">
        <div className="max-w-full mx-auto w-full">
          <Manual />
        </div>
      </main>
    </div>
  );
};

export default ManualUploadPage;
