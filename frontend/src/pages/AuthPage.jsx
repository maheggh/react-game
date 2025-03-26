import React from 'react';
import Register from '../components/Register';
import Login from '../components/Login';

const AuthPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="space-y-8">
      <Register />
      <Login />
    </div>
  </div>
);

export default AuthPage;
