import React, { useEffect, useState } from "react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPrivilege, setSelectedPrivilege] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Operator",
    privileges: [],
    password: "",
  });

  const privilegeOptions = [
    "System Admin",
    "View Dashboard",
    "Ask Questions",
    "Input Answers",
  ];
  const roleOptions = ["Operator", "Supervisor", "Manager", "Admin"];

  const USER_BASE_URL =
    import.meta.env.VITE_APP_USER_URL || "http://localhost:3000/api/v1";

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(USER_BASE_URL + "/users");
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

    // Filter by role
    if (selectedRole) {
      tempUsers = tempUsers.filter((user) => user.role === selectedRole);
    }

    // Filter by privilege - now checks if the user has the selected privilege in their array
    if (selectedPrivilege) {
      tempUsers = tempUsers.filter((user) =>
        user.privileges.includes(selectedPrivilege)
      );
    }

    // Filter by search term (name)
    if (searchTerm) {
      tempUsers = tempUsers.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(tempUsers);
  };

  const resetFilters = () => {
    setSelectedRole("");
    setSelectedPrivilege("");
    setSearchTerm("");
    setFilteredUsers(users);
  };

  // Handle Edit Modal and Save Function
  const handleEdit = (user) => {
    setEditUser(user);
  };

  const handleSave = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await fetch(
        USER_BASE_URL + `/users/update/${editUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
      setEditUser(null);
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDelete = async (userId) => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await fetch(USER_BASE_URL + `/users/delete/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

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

  const handleAddUser = async () => {
    const token = sessionStorage.getItem("token");
    try {
      if (
        !newUser.name ||
        !newUser.email ||
        !newUser.password ||
        !newUser.role ||
        newUser.privileges.length === 0
      ) {
        alert(
          "All fields are required and at least one privilege must be selected."
        );
        return;
      }

      const response = await fetch(USER_BASE_URL + "/users/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
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

      setShowAddModal(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "Operator",
        privileges: [],
      });
    } catch (error) {
      console.error("Error adding new user:", error);
    }
  };

  // New handler for privilege checkboxes
  const handlePrivilegeChange = (privilege, isAdd = true) => {
    if (isAdd) {
      setNewUser((prev) => ({
        ...prev,
        privileges: prev.privileges.includes(privilege)
          ? prev.privileges.filter((p) => p !== privilege)
          : [...prev.privileges, privilege],
      }));
    } else {
      setEditUser((prev) => ({
        ...prev,
        privileges: prev.privileges.includes(privilege)
          ? prev.privileges.filter((p) => p !== privilege)
          : [...prev.privileges, privilege],
      }));
    }
  };

  return (
    <div className="w-full p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center py-4 px-8 bg-white border-b shadow-md">
        <h2 className="text-2xl font-bold">Manage Users</h2>
      </div>

      {/* Filter and add user section */}
      <div className="p-4 bg-white rounded-lg shadow-md mt-4 flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border border-gray-300 rounded-md py-1 px-3 w-full lg:w-1/4"
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
          className="border border-gray-300 rounded-md py-1 px-3 w-full lg:w-1/4"
        >
          <option value="">Filter by Privilege</option>
          {privilegeOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md py-1 px-3 w-full lg:w-1/4"
          placeholder="Search by Name"
        />

        <div className="flex space-x-2">
          <button
            onClick={filterUsers}
            className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-500 text-white py-1 px-4 rounded-lg hover:bg-gray-600"
          >
            Reset Filters
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-500 text-white py-1 px-4 rounded-lg hover:bg-purple-600"
          >
            + Add New User
          </button>
        </div>
      </div>

      {/* User List/Table */}
      <div
        className="mt-6 bg-white rounded-lg shadow-md overflow-y-auto"
        style={{ maxHeight: "650px" }}
      >
        {/* Mobile View */}
        <div className="lg:hidden">
          {filteredUsers.map((user, index) => (
            <div key={index} className="p-4 border-b">
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
              <div className="text-sm">Role: {user.role}</div>
              <div className="text-sm">
                Privileges: {user.privileges.join(", ")}
              </div>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="bg-green-500 text-white py-1 px-3 rounded-lg text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="bg-red-500 text-white py-1 px-3 rounded-lg text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <table className="hidden lg:table w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Role</th>
              <th className="py-2 px-4 text-left">Privileges</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">{user.name}</td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4">{user.role}</td>
                <td className="py-2 px-4">{user.privileges.join(", ")}</td>
                <td className="py-2 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="bg-green-500 text-white py-1 px-3 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-500 text-white py-1 px-3 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Add New User</h3>
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="border border-gray-300 rounded-md py-2 px-4 w-full mb-4"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="border border-gray-300 rounded-md py-2 px-4 w-full mb-4"
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              className="border border-gray-300 rounded-md py-2 px-4 w-full mb-4"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="border border-gray-300 rounded-md py-2 px-4 w-full mb-4"
            >
              <option value="">Select Role</option>
              {roleOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Privileges
              </label>
              <div className="space-y-2">
                {privilegeOptions.map((privilege, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`add-privilege-${privilege}`}
                      checked={newUser.privileges.includes(privilege)}
                      onChange={() => handlePrivilegeChange(privilege, true)}
                      className="mr-2"
                    />
                    <label htmlFor={`add-privilege-${privilege}`}>
                      {privilege}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>
            <input
              type="text"
              value={editUser.name}
              onChange={(e) =>
                setEditUser({ ...editUser, name: e.target.value })
              }
              className="border border-gray-300 rounded-md py-2 px-4 w-full mb-4"
            />
            <input
              type="email"
              value={editUser.email}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
              className="border border-gray-300 rounded-md py-2 px-4 w-full mb-4"
            />
            <select
              value={editUser.role}
              onChange={(e) =>
                setEditUser({ ...editUser, role: e.target.value })
              }
              className="border border-gray-300 rounded-md py-2 px-4 w-full mb-4"
            >
              {roleOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Privileges
              </label>
              <div className="space-y-2">
                {privilegeOptions.map((privilege, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`edit-privilege-${privilege}`}
                      checked={editUser.privileges.includes(privilege)}
                      onChange={() => handlePrivilegeChange(privilege, false)}
                      className="mr-2"
                    />
                    <label htmlFor={`edit-privilege-${privilege}`}>
                      {privilege}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditUser(null)}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
