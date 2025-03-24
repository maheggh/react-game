// context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Optional states for user attributes. You can also just keep them inside `user`.
  const [xp, setXp] = useState(0);
  const [rank, setRank] = useState('Homeless Potato');
  const [money, setMoney] = useState(0);
  const [kills, setKills] = useState(0);
  const [isAlive, setIsAlive] = useState(true);

  const [stolenItems, setStolenItems] = useState([]);
  const [inJail, setInJail] = useState(false);
  const [jailTime, setJailTime] = useState(0);

  const [loading, setLoading] = useState(true);

  // Fetches user profile from /api/users/profile using credentials: 'include' (cookie-based)
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'GET',
        credentials: 'include', // important for sending the cookie
      });

      if (!response.ok) {
        // If 401, 403, or any error
        console.error('Failed to fetch user profile:', response.status);
        logout();
        return;
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.userData);
        setXp(data.userData.xp || 0);
        setRank(data.userData.rank || 'Homeless Potato');
        setMoney(data.userData.money || 0);
        setKills(data.userData.kills || 0);
        setIsAlive(data.userData.isAlive !== undefined ? data.userData.isAlive : true);
        setStolenItems(data.userData.stolenItems || []);
        setInJail(data.userData.inJail || false);

        // If your server returns jailTimeEnd, you can calculate the countdown:
        if (data.userData.jailTimeEnd) {
          const currentTime = Date.now();
          const jailTimeRemaining = Math.ceil((new Date(data.userData.jailTimeEnd).getTime() - currentTime) / 1000);
          if (jailTimeRemaining > 0) {
            setJailTime(jailTimeRemaining);
          } else {
            setInJail(false);
            setJailTime(0);
          }
        }
        setIsLoggedIn(true);
      } else {
        console.error('User profile not fetched:', data.message);
        logout();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // On mount, try to fetch user profile to see if cookie is valid
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      await fetchUserData();
      setLoading(false);
    };
    initializeAuth();
  }, []);

  // "login" calls your /api/users/login endpoint with credentials: 'include'
  // If successful, we do fetchUserData again to confirm we have a valid session
  const login = async (username, password) => {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // sends/receives cookies
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // The server has now set an HTTP-only cookie
        // We'll fetch the user profile to update local state
        await fetchUserData();
        return true;
      } else {
        console.error('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // "logout" calls /api/users/logout, which clears the cookie server-side
  const logout = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    setIsLoggedIn(false);
    setUser(null);
    setXp(0);
    setRank('Homeless Potato');
    setMoney(0);
    setKills(0);
    setIsAlive(true);
    setStolenItems([]);
    setInJail(false);
    setJailTime(0);
    setLoading(false);
  };

  // Optionally update user data (cars, xp, money, etc.) then re-fetch
  const updateUserData = async (updates) => {
    try {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchUserData();
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
        kills,
        isAlive,
        stolenItems,
        inJail,
        jailTime,
        setIsAlive,
        setStolenItems,
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
