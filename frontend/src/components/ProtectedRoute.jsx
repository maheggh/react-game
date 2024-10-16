// components/ProtectedRoute.js

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isAlive, loading } = useContext(AuthContext);

  // While loading, render a loader or nothing
  if (loading) {
    return null; // Or a loading spinner component
  }

  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // If logged in but dead, redirect to DeadPage
  if (!isAlive) {
    return <Navigate to="/dead" />;
  }

  // If logged in and alive, render the protected component
  return children;
};

export default ProtectedRoute;
