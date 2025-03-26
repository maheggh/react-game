import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isAlive, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/auth" />;
  }

  if (!isAlive) {
    return <Navigate to="/dead" />;
  }

  return children;
};

export default ProtectedRoute;
