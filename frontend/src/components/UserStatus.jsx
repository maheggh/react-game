import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserStatus = () => {
  const { user, isLoggedIn, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [password, setPassword] = useState(''); // Store the password
  const [showPassword, setShowPassword] = useState(false); // Toggle visibility
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
    <div>
      <h2>Welcome, {userData.username}</h2>
      <p>Level: {userData.level}</p>
      <p>Rank: {userData.rank}</p>
      <p>Money: ${userData.money}</p>
      
      {/* Password display */}
      {password && (
        <p>
          Password: 
          <span>{showPassword ? password : '••••••••'}</span>
          <button
            onClick={() => setShowPassword(!showPassword)}
            style={{ marginLeft: '10px', cursor: 'pointer' }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </p>
      )}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default UserStatus;
