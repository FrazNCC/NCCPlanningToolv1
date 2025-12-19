
import React, { useState } from 'react';
import { User } from '../types';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onAdminLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onAdminLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const uname = username.trim();
    const pass = password.trim();

    if (!uname || !pass) {
      setError('Please enter both username and password.');
      return;
    }

    // Check for Admin Login
    if (uname === 'Frazadmin' && pass === 'Frazadmin') {
        onAdminLogin();
        return;
    }

    const storedUsers = localStorage.getItem('planner_users');
    const users = storedUsers ? JSON.parse(storedUsers) : {};

    if (isRegistering) {
      if (uname.toLowerCase() === 'frazadmin') {
          setError('Cannot register with this reserved username.');
          return;
      }
      if (users[uname]) {
        setError('Username already exists.');
        return;
      }
      // Register new user
      const newUser = { password: pass, lastLogin: new Date().toISOString() };
      users[uname] = newUser; 
      localStorage.setItem('planner_users', JSON.stringify(users));
      onLogin({ username: uname, lastLogin: newUser.lastLogin });
    } else {
      // Login
      if (users[uname] && users[uname].password === pass) {
        // Update last login
        const now = new Date().toISOString();
        users[uname].lastLogin = now;
        localStorage.setItem('planner_users', JSON.stringify(users));
        
        onLogin({ username: uname, lastLogin: now });
      } else {
        setError('Invalid username or password.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white">Course Planner</h1>
          <p className="text-indigo-200 mt-2">Plan units and assign teaching hours efficiently.</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              {isRegistering ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                {isRegistering ? 'Log in' : 'Register now'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
