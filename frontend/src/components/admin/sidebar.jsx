import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUsers, FaCog, FaHome, FaLink, FaUser, FaExclamationTriangle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
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
            to="/dashboard"
            className={`flex items-center ${isOpen ? 'space-x-4' : 'justify-center'} ${
              isActivePath('/dashboard') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
            } transition duration-300 ease-in-out transform hover:scale-105`}
          >
            <FaHome size={32} />
            {isOpen && <span className="text-xl font-semibold">Dashboard</span>}
          </Link>
          <Link
            to="/Admin"
            className={`flex items-center ${isOpen ? 'space-x-4' : 'justify-center'} ${
              isActivePath('/Admin') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
            } transition duration-300 ease-in-out transform hover:scale-105`}
          >
            <FaUsers size={32} />
            {isOpen && <span className="text-xl font-semibold">Admin Dashboard</span>}
          </Link>
          <Link
            to="/qna"
            className={`flex items-center ${isOpen ? 'space-x-4' : 'justify-center'} ${
              isActivePath('/qna') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
            } transition duration-300 ease-in-out transform hover:scale-105`}
          >
            <FaLink size={32} />
            {isOpen && <span className="text-xl font-semibold">QnA page</span>}
          </Link>
          <Link
            to="/Upload"
            className={`flex items-center ${isOpen ? 'space-x-4' : 'justify-center'} ${
              isActivePath('/Upload') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
            } transition duration-300 ease-in-out transform hover:scale-105`}
          >
            <FaCog size={32} />
            {isOpen && <span className="text-xl font-semibold">Add Manual</span>}
          </Link>
          <Link
            to="/logout"
            className={`flex items-center ${isOpen ? 'space-x-4' : 'justify-center'} ${
              isActivePath('/logout') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
            } transition duration-300 ease-in-out transform hover:scale-105`}
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