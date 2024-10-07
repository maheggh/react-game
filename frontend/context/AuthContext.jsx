import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode'; // Use this working import

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token); // Decode token using jwt_decode
        setIsLoggedIn(true);
        setUser(decoded);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token'); // Clear invalid token
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token); 
    const decoded = jwt_decode(token);
    setIsLoggedIn(true);
    setUser(decoded);
  };

  const logout = () => {
    localStorage.removeItem('token'); 
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
