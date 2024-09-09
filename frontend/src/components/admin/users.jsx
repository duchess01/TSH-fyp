import React, { useEffect, useState } from "react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("");
  const [selectedPrivileges, setSelectedPrivileges] = useState("");

  const privilegesOptions = [
    "Ask Questions",
    "Input Answers",
    "Manager Dashboard",
    "Admin Dashboard",
  ];
  const employeeTypeOptions = ["Operator", "Supervisor", "Manager", "Admin"];

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/v1/");
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUsers();
  }, []);

  // Filter function
  const filterUsers = () => {
    let tempUsers = users;

    if (selectedEmployeeType) {
      tempUsers = tempUsers.filter(
        (user) => user.employee_type === selectedEmployeeType
      );
    }

    if (selectedPrivileges) {
      tempUsers = tempUsers.filter((user) => user.privileges === selectedPrivileges);
    }

    setFilteredUsers(tempUsers);
  };

  const resetFilters = () => {
    setSelectedEmployeeType("");
    setSelectedPrivileges("");
    setFilteredUsers(users);
  };

  return (
    <div className="w-full p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center py-4 px-8 bg-white border-b shadow-md">
        <div className="flex items-center space-x-4">
        <img
            alt="Logo"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            className="h-12 w-12"
          />
          <h2 className="text-2xl font-bold font-sans tracking-wide">Manage Users</h2>
        </div>
        <button className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600">
          + Add User
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white rounded-lg shadow-md mt-4 flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
        <select
          value={selectedEmployeeType}
          onChange={(e) => setSelectedEmployeeType(e.target.value)}
          className="border border-gray-300 rounded-md py-2 px-4 w-full lg:w-1/3"
        >
          <option value="">Filter by Employee Type</option>
          {employeeTypeOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={selectedPrivileges}
          onChange={(e) => setSelectedPrivileges(e.target.value)}
          className="border border-gray-300 rounded-md py-2 px-4 w-full lg:w-1/3"
        >
          <option value="">Filter by Privileges</option>
          {privilegesOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>

        <div className="flex space-x-2 lg:mt-0 mt-4">
          <button
            onClick={filterUsers}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Employee Type
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Privileges
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.employee_type}</td>
                <td className="px-6 py-4">{user.phone}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.privileges}
                    onChange={(e) => {
                      const updatedUsers = [...filteredUsers];
                      updatedUsers[index].privileges = e.target.value;
                      setFilteredUsers(updatedUsers);
                    }}
                    className="border border-gray-300 rounded-md py-2 px-4"
                  >
                    {privilegesOptions.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-gray-500 text-sm">
        <span>Rows per page: 5</span>
        <span>1–5 of 5</span>
      </div>
    </div>
  );
};

export default Users;
