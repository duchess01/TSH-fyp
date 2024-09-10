import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaCog, FaHome, FaLink, FaUser, FaExclamationTriangle, FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Import icons

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`h-screen bg-white transition-all duration-300 shadow-md ${isOpen ? 'w-72' : 'w-24'}`}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="flex justify-between items-center p-6">
          <Link to="/" className={`text-blue-600 ${isOpen ? 'text-3xl' : 'text-2xl'} font-bold tracking-wide`}>
            {isOpen ? 'TSH Group' : 'TSH'}
          </Link>
          <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none">
            {isOpen ? <FaChevronLeft size={24} /> : <FaChevronRight size={24} />}
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex flex-col flex-grow space-y-8 p-6 text-gray-700">
          <Link
            to="/overview"
            className={`flex items-center ${isOpen ? 'space-x-4' : 'justify-center'} hover:text-blue-600 transition duration-300 ease-in-out transform hover:scale-105`}
          >
            <FaHome size={32} />
            {isOpen && <span className="text-xl font-semibold">Dashboard</span>}
          </Link>
          <Link
            to="/customers"
            className={`flex items-center ${isOpen ? 'space-x-4' : 'justify-center'} text-blue-600 font-semibold transition duration-300 ease-in-out transform hover:scale-105`}
          >
            <FaUsers size={32} />
            {isOpen && <span className="text-xl font-semibold">Admin Dashboard</span>}
          </Link>
          <Link
            to="/integrations"
            className={`flex items-center ${isOpen ? 'space-x-4' : 'justify-center'} hover:text-blue-600 transition duration-300 ease-in-out transform hover:scale-105`}
          >
            <FaLink size={32} />
            {isOpen && <span className="text-xl font-semibold">Knowledge Base</span>}
          </Link>
          <Link
            to="/settings"
            className={`flex items-center ${isOpen ? 'space-x-4' : 'justify-center'} hover:text-blue-600 transition duration-300 ease-in-out transform hover:scale-105`}
          >
            <FaCog size={32} />
            {isOpen && <span className="text-xl font-semibold">Add Manual</span>}
          </Link>
          <Link
            to="/account"
            className={`flex items-center ${isOpen ? 'space-x-4' : 'justify-center'} hover:text-blue-600 transition duration-300 ease-in-out transform hover:scale-105`}
          >
            <FaUser size={32} />
            {isOpen && <span className="text-xl font-semibold">Add User</span>}
          </Link>
          <Link
            to="/error"
            className={`flex items-center ${isOpen ? 'space-x-4' : 'justify-center'} hover:text-blue-600 transition duration-300 ease-in-out transform hover:scale-105`}
          >
            <FaExclamationTriangle size={32} />
            {isOpen && <span className="text-xl font-semibold">Logout</span>}
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
