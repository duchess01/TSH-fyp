import React, { useState } from 'react';

const UserManagementPage = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', employeeType: 'Manager', privileges: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', employeeType: 'Supervisor', privileges: 'Editor' },
    { id: 2, name: 'Jaden Smith', email: 'jaden.smith@example.com', employeeType: 'Operator', privileges: 'Viewer' }
  ]);

  const [privilegeOptions] = useState(['Admin', 'Editor', 'Viewer']);

  const addUser = () => {
    alert('Add User button clicked');
  };

  const editUser = (userId) => {
    alert(`Edit user with ID: ${userId}`);
  };

  const handlePrivilegeChange = (userId, newPrivilege) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, privileges: newPrivilege } : user
    ));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>User Dashboard</h2>
      <button onClick={addUser} style={styles.addButton}>Add User</button>
      
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.tableCell}>Name</th>
              <th style={styles.tableCell}>Email</th>
              <th style={styles.tableCell}>Employee Type</th>
              <th style={styles.tableCell}>Privileges</th>
              <th style={styles.tableCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{user.name}</td>
                <td style={styles.tableCell}>{user.email}</td>
                <td style={styles.tableCell}>{user.employeeType}</td>
                <td style={styles.tableCell}>
                  <select
                    value={user.privileges}
                    onChange={(e) => handlePrivilegeChange(user.id, e.target.value)}
                    style={styles.dropdown}
                  >
                    {privilegeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </td>
                <td style={styles.tableCell}>
                  <button onClick={() => editUser(user.id)} style={styles.editButton}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '3000px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f0f0f0', // Matches the background color, no card-like appearance
  },
  heading: {
    fontSize: '2.5rem',
    color: '#2f3185',
    textAlign: 'center',
    marginBottom: '30px',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#2f3185',
    color: '#fff',
    padding: '12px 25px',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    transition: 'all 0.3s ease',
    display: 'block',
    margin: '0 auto 30px auto',
  },
  tableContainer: {
    width: '100%',
    marginTop: '20px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'transparent', // Transparent background to blend with container
  },
  tableHeader: {
    backgroundColor: '#2f3185', // Same color as your preferred button color
    color: '#fffff', // White text for the header
    textAlign: 'left',
    fontWeight: '500',
  },
  tableCell: {
    padding: '15px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '1rem',
    color: '#333',
  },
  tableRow: {
    transition: 'background-color 0.3s ease',
  },
  dropdown: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    outline: 'none',
    cursor: 'pointer',
  },
  editButton: {
    backgroundColor: '#2f3185',
    color: '#fff',
    padding: '8px 15px',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
  },
};

export default UserManagementPage;
