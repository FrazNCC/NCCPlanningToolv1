
import React, { useState, useEffect } from 'react';
import { TrashIcon, EditIcon } from './Icons';

interface AdminPageProps {
  onLogout: () => void;
}

interface UserData {
  password: string;
  lastLogin?: string;
}

const AdminPage: React.FC<AdminPageProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<Record<string, UserData>>({});

  useEffect(() => {
    const storedUsers = localStorage.getItem('planner_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);

  const handleDeleteUser = (username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This will also delete all their data.`)) {
      const updatedUsers = { ...users };
      delete updatedUsers[username];
      setUsers(updatedUsers);
      localStorage.setItem('planner_users', JSON.stringify(updatedUsers));
      
      // Also clean up their data
      localStorage.removeItem(`planner_data_${username}`);
    }
  };

  const handleResetPassword = (username: string) => {
    const newPassword = prompt(`Enter new password for user "${username}":`);
    if (newPassword !== null && newPassword.trim() !== '') {
      const updatedUsers = { ...users };
      updatedUsers[username] = { ...updatedUsers[username], password: newPassword };
      setUsers(updatedUsers);
      localStorage.setItem('planner_users', JSON.stringify(updatedUsers));
      alert(`Password for ${username} has been updated.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-400">
            Admin Dashboard
          </h1>
          <button 
            onClick={onLogout}
            className="text-sm text-red-400 hover:text-red-300 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Registered Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Logged In</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(users).length === 0 ? (
                    <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No users registered yet.</td>
                    </tr>
                ) : (
                    Object.entries(users).map(([username, data]: [string, UserData]) => (
                    <tr key={username}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {data.lastLogin ? new Date(data.lastLogin).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                            onClick={() => handleResetPassword(username)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                            title="Reset Password"
                        >
                            Reset Password
                        </button>
                        <button 
                            onClick={() => handleDeleteUser(username)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete User"
                        >
                            Delete
                        </button>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
