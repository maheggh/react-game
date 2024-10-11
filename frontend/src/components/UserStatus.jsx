import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserStatus = () => {
  const { user, isLoggedIn, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [password, setPassword] = useState(''); // Store the password
  const [showPassword, setShowPassword] = useState(false); // Toggle visibility
  const [showInventory, setShowInventory] = useState(false); // Toggle inventory visibility
  const [showBossItems, setShowBossItems] = useState(false); // Toggle boss items visibility
  const [showCars, setShowCars] = useState(false); // Toggle cars visibility
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      const fetchUserData = async () => {
        const response = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await response.json();
        setUserData(data.userData);

        // Retrieve password from localStorage (for registration purposes)
        const storedPassword = localStorage.getItem('password');
        if (storedPassword) {
          setPassword(storedPassword); // Set the password
        }
      };

      fetchUserData();
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('password'); // Clear password on logout
    navigate('/');
  };

  if (!isLoggedIn) return <p>Not logged in</p>;
  if (!userData) return <p>Loading user data...</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold">Welcome, {userData.username}</h2>
      <p className="text-lg">Money: ${userData.money}</p>

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
