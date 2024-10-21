// pages/UserStatus.jsx

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserStatus = () => {
  const { user, isLoggedIn, logout, loading } = useContext(AuthContext);
  const [password, setPassword] = useState(''); // Store the password
  const [showPassword, setShowPassword] = useState(false); // Toggle visibility
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && user) {
      // Retrieve password from localStorage (for registration purposes)
      const storedPassword = localStorage.getItem('password');
      console.log('Stored password in localStorage:', storedPassword);  // Log to check
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

  if (loading) return <p>Loading...</p>;
  if (!isLoggedIn) return <p>Not logged in</p>;
  if (!user) return <p>Loading user data...</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold">Welcome, {user.username}</h2>
      <p className="text-lg">Money: ${user.money}</p>

      {/* Password display */}
      {password && (
        <div className="my-4">
          <p>
            Password: 
            <span>{showPassword ? password : '••••••••'}</span>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
            >
              {showPassword ? '🙈 Hide' : '👁️ Show'}
            </button>
          </p>
        </div>
      )}

      {/* Additional user data display can be added here */}
      {/* For example, Inventory, Cars, etc. */}

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default UserStatus;
