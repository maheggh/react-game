// pages/DeadPage.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DeadPage = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-6">You Have Died</h1>
      <p className="text-lg text-gray-700 mb-4">You died, how unfortunate.</p>
      <img src="/assets/dead.png" alt="You Are Dead" className="mb-4 w-2/5 ml-auto mr-auto" />
      <button 
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Logout and Start Over
      </button>
    </div>
  );
};

export default DeadPage;
