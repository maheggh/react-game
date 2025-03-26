import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [money, setMoney] = useState(0);
  const [isAlive, setIsAlive] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        logout();
        return;
      }

      const data = await res.json();
      if (data.success) {
        setUser(data.userData);
        setMoney(typeof data.userData.money === 'number' ? data.userData.money : 0);
        setIsAlive(data.userData.isAlive !== false);
        setIsLoggedIn(true);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwt_decode(token);
          if (decoded.exp * 1000 < Date.now()) {
            logout();
          } else {
            await fetchUserData();
          }
        } catch {
          logout();
        }
      } else {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (token) => {
    localStorage.setItem('token', token);
    await fetchUserData();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('password');
    setIsLoggedIn(false);
    setUser(null);
    setMoney(0);
    setIsAlive(true);
    setLoading(false);
  };

  const updateUserData = async (updatedData) => {
    const token = localStorage.getItem('token');
    if (!user || !user.userId) return;

    try {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        await fetchUserData();
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
        money,
        setMoney,
        isAlive,
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
