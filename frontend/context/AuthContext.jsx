// context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [xp, setXp] = useState(0);
  const [rank, setRank] = useState('Homeless Potato');
  const [money, setMoney] = useState(0);
  const [isAlive, setIsAlive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000; // Convert to seconds

        if (decoded.exp < currentTime) {
          console.error('Token expired');
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setUser(null);
        } else {
          setIsLoggedIn(true);
          setUser(decoded);
          fetchUserData(); // Fetch additional user data
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
      }
    }
    setLoading(false); // Set loading to false after token check
  }, []);

  // Fetch user data including the 'isAlive' status
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        setIsLoggedIn(false);
        return;
      }

      const response = await fetch('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        console.error('Token verification failed');
        setIsLoggedIn(false);  // Invalidate session
        return;
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.userData);
        setXp(data.userData.xp || 0);
        setRank(data.userData.rank || 'Homeless Potato');
        setMoney(data.userData.money || 0);
        setIsAlive(data.userData.isAlive !== undefined ? data.userData.isAlive : true);
      } else {
        console.error('Failed to fetch user data:', data.message);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsLoggedIn(false);
    }
  };

  // Handle login and fetching user data
  const login = async (token) => {
    try {
      localStorage.setItem('token', token);
      const decoded = jwt_decode(token);
      setIsLoggedIn(true);
      setUser(decoded);  // Ensure this includes the user's _id
      await fetchUserData(); // Fetch complete user data after login
    } catch (error) {
      console.error('Error during login:', error);
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  // Handle logout and reset state
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('password'); // Clear password on logout
    setIsLoggedIn(false);
    setUser(null);
    setXp(0);
    setRank('Homeless Potato');
    setMoney(0);
    setIsAlive(true);
  };

  // Handle updating user data and refreshing the user state
  const updateUserData = async (updatedData) => {
    if (!user || !user._id) {
      console.error('Cannot update user data: User is not logged in or missing _id');
      return;
    }

    try {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        await fetchUserData(); // Refresh the user data after updating
      } else {
        const data = await response.json();
        console.error('Failed to update user data:', data.message);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      xp, 
      rank, 
      money, 
      isAlive, 
      setIsAlive,  // Ensure setIsAlive is included in the context
      login, 
      logout, 
      updateUserData,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
