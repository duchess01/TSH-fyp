import React, { useEffect, useState } from "react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPrivilege, setSelectedPrivilege] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    privilege: "",
  });

  const privilegeOptions = [
    "Ask Questions",
    "Input Answers",
    "Manager Dashboard",
    "System Admin",
  ];
  const roleOptions = ["Operator", "Supervisor", "Manager", "Admin"];

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/v1/users");
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

    if (selectedRole) {
      tempUsers = tempUsers.filter((user) => user.role === selectedRole);
    }

    if (selectedPrivilege) {
      tempUsers = tempUsers.filter(
        (user) => user.privilege === selectedPrivilege
      );
    }

    setFilteredUsers(tempUsers);
  };

  const resetFilters = () => {
    setSelectedRole("");
    setSelectedPrivilege("");
    setFilteredUsers(users);
  };

  // Handle Edit Modal and Save Function
  const handleEdit = (user) => {
    setEditUser(user);
  };

  const handleSave = async () => {
    const token = sessionStorage.getItem("token"); 
    //const token = localStorage.getItem("token"); // Adjust as needed
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/users/update/${editUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include token
          },
          body: JSON.stringify(editUser),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status} - ${errorText}`
        );
      }

      const updatedUser = await response.json();
      const updatedUsers = users.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setEditUser(null); // Close modal
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDelete = async (userId) => {
    const token = sessionStorage.getItem("token");   // Adjust as needed

    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/users/delete/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include token
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status} - ${errorText}`
        );
      }

      const updatedUsers = users.filter((user) => user.id !== userId);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Handle Add User Modal
  const handleAddUser = async () => {
    const token = sessionStorage.getItem("token");  
    try {
      // Ensure all necessary fields (including password) are present
      if (!newUser.name || !newUser.email || !newUser.password || !newUser.role || !newUser.privilege) {
        alert("All fields are required.");
        return;
      }
  
      const response = await fetch("http://localhost:3000/api/v1/users/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include token for authorization
        },
        body: JSON.stringify(newUser), // Ensure password is included in the body
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status} - ${errorText}`
        );
      }
  
      const addedUser = await response.json();
      const updatedUsers = [...users, addedUser];
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setShowAddModal(false); // Close modal
      // Reset new user form, including password
      setNewUser({ name: "", email: "", password: "", role: "", privilege: "" });
    } catch (error) {
      console.error("Error adding new user:", error);
    }
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
          <h2 className="text-2xl font-bold font-sans tracking-wide">
            Manage Users
          </h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600"
        >
          + Add User
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white rounded-lg shadow-md mt-4 flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border border-gray-300 rounded-md py-2 px-4 w-full lg:w-1/3"
        >
          <option value="">Filter by Role</option>
          {roleOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={selectedPrivilege}
          onChange={(e) => setSelectedPrivilege(e.target.value)}
          className="border border-gray-300 rounded-md py-2 px-4 w-full lg:w-1/3"
        >
          <option value="">Filter by Privilege</option>
          {privilegeOptions.map((option, index) => (
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
      <div className="overflow-x-auto mt-6 max-h-screen">
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
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Privilege
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
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">{user.privilege}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEdit(user)}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red -600 ml-2">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Edit User</h3>
              <input
                type="text"
                value={editUser.name}
                onChange={(e) =>
                  setEditUser({ ...editUser, name: e.target.value })
                }
                className="border border-gray-300 rounded-md py-2 px-4 w-full mb-4"
                placeholder="Name"
              />
              <input
                type="email"
                value={editUser.email}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
                className="border border-gray-300 rounded-md py-2 px-4 w-full mb-4"
                placeholder="Email"
              />
              <select
                value={editUser.role}
                onChange={(e) =>
                  setEditUser({ ...editUser, role: e.target.value })
                }
                className="border border-gray-300 rounded-md py-2 px-4 w-full mb-4"
              >
                <option value="">Select Role</option>
                {roleOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={editUser.privilege}
                onChange={(e) =>
                  setEditUser({ ...editUser, privilege: e.target.value })
                }
                className="border border-gray-300 rounded-md py-2 px-4 w-full mb-4"
              >
                <option value="">Select Privilege</option>
                {privilegeOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setEditUser(null)}
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Add New User</h3>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="border border-gray-300 rounded-md py-2 px-4 w-full mb-4"
                placeholder="Name"
              />
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="border border-gray-300 rounded-md py-2 px-4 w-full mb-4"
                placeholder="Email"
              />
              <input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="border border-gray-300 rounded-md py-2 px-4 w-full mb-4"
                placeholder="Password"
              />
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="border border-gray-300 rounded-md py-2 px-4 w-full mb-4"
              >
                <option value="">Select Role</option>
                {roleOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={newUser.privilege}
                onChange={(e) =>
                  setNewUser({ ...newUser, privilege: e.target.value })
                }
                className="border border-gray-300 rounded-md py-2 px-4 w-full mb-4"
              >
                <option value="">Select Privilege</option>
                {privilegeOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
