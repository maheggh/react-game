import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Register = () => {
  const { login, isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const [generatedUsername, setGeneratedUsername] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const registerUser = async () => {
    setIsRegistering(true);
    setMessage(null);
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setGeneratedUsername(data.userData.username || '');
        if (data.userData.password) {
          setGeneratedPassword(data.userData.password);
        }
        setMessage({ type: 'success', text: data.message || 'User registered successfully!' });
        const success = await login();
        if (success) {
          navigate('/cartheft');
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Error registering user:', error);
      setMessage({ type: 'error', text: 'Error registering user' });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
      <div className="flex items-center justify-center mb-6">
        <FaUserPlus className="text-blue-500 mr-2" size={32} />
        <h2 className="text-2xl font-bold text-gray-800">Register to Play</h2>
      </div>
      <button
        onClick={registerUser}
        className={`w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 ${
          isRegistering ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isRegistering}
      >
        {isRegistering ? 'Registering...' : (
          <>
            <FaUserPlus className="mr-2" />
            Generate Random Gangster Name
          </>
        )}
      </button>
      {(generatedUsername || generatedPassword) && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-md">
          <div className="flex items-center mb-2">
            <FaCheckCircle className="text-green-600 mr-2" />
            <span className="font-semibold text-green-700">Registration Successful!</span>
          </div>
          {generatedUsername && (
            <p className="text-gray-700">
              <span className="font-semibold">Username:</span> {generatedUsername}
            </p>
          )}
          {generatedPassword && (
            <p className="text-gray-700 mt-2">
              <span className="font-semibold">Password:</span> {generatedPassword}
            </p>
          )}
        </div>
      )}
      {message && (
        <div
          className={`mt-6 p-4 rounded-md flex items-center ${
            message.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}
          role="alert"
        >
          {message.type === 'success' ? (
            <FaCheckCircle className="mr-2" />
          ) : (
            <FaTimesCircle className="mr-2" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
};

export default Register;
