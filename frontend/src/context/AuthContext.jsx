// context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Authentication and user state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // User data
  const [xp, setXp] = useState(0);
  const [rank, setRank] = useState('Homeless Potato');
  const [money, setMoney] = useState(0);
  const [kills, setKills] = useState(0); // Added kills state
  const [isAlive, setIsAlive] = useState(true);

  // Theft-related state
  const [stolenItems, setStolenItems] = useState([]);
  const [inJail, setInJail] = useState(false);
  const [jailTime, setJailTime] = useState(0);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Function to fetch user data from the backend
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
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        console.error('Token verification failed');
        logout(); // Invalidate session
        return;
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.userData);
        setXp(data.userData.xp || 0);
        setRank(data.userData.rank || 'Homeless Potato');
        setMoney(data.userData.money || 0);
        setKills(data.userData.kills || 0); // Set kills from userData
        setIsAlive(data.userData.isAlive !== undefined ? data.userData.isAlive : true);
        setStolenItems(data.userData.stolenItems || []);
        setInJail(data.userData.inJail || false);

        // Calculate remaining jail time if applicable
        if (data.userData.jailTimeEnd) {
          const currentTime = Date.now();
          const jailTimeRemaining = Math.ceil((new Date(data.userData.jailTimeEnd).getTime() - currentTime) / 1000);
          if (new Date(data.userData.jailTimeEnd).getTime() > currentTime) {
            setJailTime(jailTimeRemaining);
          } else {
            // Jail time has expired
            setInJail(false);
            setJailTime(0);
          }
        }
      } else {
        console.error('Failed to fetch user data:', data.message);
        logout(); // Invalidate session
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout(); // Invalidate session
    } finally {
      setLoading(false);
    }
  };

  // Check authentication status on component mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwt_decode(token);
          const currentTime = Date.now() / 1000; // Convert to seconds

          if (decoded.exp < currentTime) {
            console.error('Token expired');
            logout();
          } else {
            setIsLoggedIn(true);
            setUser(decoded);
            fetchUserData(); // Fetch additional user data
          }
        } catch (error) {
          console.error('Invalid token:', error);
          logout();
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs once on mount

  // Handle login and fetching user data
  const login = async (token) => {
    try {
      localStorage.setItem('token', token);
      const decoded = jwt_decode(token);
      setIsLoggedIn(true);
      setUser(decoded); // Ensure this includes the user's _id
      await fetchUserData(); // Fetch complete user data after login
    } catch (error) {
      console.error('Error during login:', error);
      logout();
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
    setKills(0); // Reset kills
    setIsAlive(true);
    setStolenItems([]);
    setInJail(false);
    setJailTime(0);
    setLoading(false);
  };

  // Handle updating user data and refreshing the user state
  const updateUserData = async (updatedData) => {
    if (!user || !user.userId) {
      console.error('Cannot update user data: User is not logged in or missing _id');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        xp,
        rank,
        money,
        kills, // Provide kills in context
        isAlive,
        setIsAlive, // Included to allow components to modify 'isAlive'
        stolenItems,
        setStolenItems,
        inJail,
        jailTime,
        setInJail,
        setJailTime,
        login,
        logout,
        updateUserData,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
