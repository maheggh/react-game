import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [xp, setXp] = useState(0);
  const [rank, setRank] = useState('Homeless Potato');
  const [money, setMoney] = useState(0);
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
          fetchUserData();
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    }
    setLoading(false); // Set loading to false after token check
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setXp(data.userData.xp || 0);
        setRank(data.userData.rank || 'Homeless Potato');
        setMoney(data.userData.money || 0);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwt_decode(token);
    setIsLoggedIn(true);
    setUser(decoded);
    fetchUserData(); // Fetch data when user logs in
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
  };

  const updateUserData = async (updatedData) => {
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
        fetchUserData(); // Refresh the user data after updating
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, xp, rank, money, login, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
