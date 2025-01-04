// frontend/src/components/UserStatus.jsx

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaSignOutAlt } from 'react-icons/fa'; 

const UserStatus = () => {
  const { user, isLoggedIn, logout, loading } = useContext(AuthContext);
  const [password, setPassword] = useState(''); 
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && user) {
      // Retrieve password from localStorage (for registration purposes)
      const storedPassword = localStorage.getItem('password');
      console.log('Stored password in localStorage:', storedPassword);  
      if (storedPassword) {
        setPassword(storedPassword); // Set the password
      } else {
        console.log('No password found in localStorage'); // Debugging message
      }
    }
  }, [isLoggedIn, user]);

  // Handle redirection to DeadPage if user is dead
  useEffect(() => {
    if (user && !user.isAlive) {
      navigate('/dead');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-xl font-semibold text-gray-700">Loading...</div>
    </div>
  );

  if (!isLoggedIn) return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-xl font-semibold text-gray-700">Not logged in</div>
    </div>
  );

  if (!user) return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-xl font-semibold text-gray-700">Loading user data...</div>
    </div>
  );

  return (
    <div className="bg-gray-100 flex items-center justify-left">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Currently logged in as</h2>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 transition-colors duration-200"
            title="Logout"
          >
            <FaSignOutAlt size={24} />
          </button>
        </div>

        {/* User Information */}
        <div className="mb-4">
          <p className="text-lg text-gray-700"><span className="font-semibold">Username:</span> {user.username}</p>
        </div>

        {/* Password Section */}
        {password && (
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Password:</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                readOnly
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
        )}

        {/* Additional User Data (Optional) */}
        {/* For example, Inventory, Cars, etc. */}

        {/* Statistics */}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-200"
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserStatus;
