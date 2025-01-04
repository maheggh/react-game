// frontend/src/components/Register.jsx

import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Importing icons from react-icons

const Register = () => {
  const { login, isLoggedIn } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // To manage loading state
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  // Generate random username and password on the backend
  const registerUser = async () => {
    setIsRegistering(true);
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})  // Sending an empty body; the backend will generate username/password
      });

      const data = await response.json();

      console.log('Registration response:', data); // Debugging

      if (data.success) {
        setUsername(data.userData.username);  // Set the generated username
        setPassword(data.userData.password);  // Set the generated password

        // Store password locally (useful for the user to see their password)
        if (data.userData.password) {
          localStorage.setItem('password', data.userData.password);
        }

        setMessage({ type: 'success', text: data.message || 'User registered successfully!' });

        if (data.token) {
          login(data.token);  // Automatically log the user in after registration
          navigate('/cartheft');  // Redirect to user status page
        }
      } else {
        setMessage({ type: 'error', text: `Failed to register user: ${data.message}` });
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
      {/* Header */}
      <div className="flex items-center justify-center mb-6">
        <FaUserPlus className="text-blue-500 mr-2" size={32} />
        <h2 className="text-2xl font-bold text-gray-800">Register to Play</h2>
      </div>

      {/* Register Button */}
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

      {/* Display the generated username and password */}
      {username && password && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-md">
          <div className="flex items-center mb-2">
            <FaCheckCircle className="text-green-600 mr-2" />
            <span className="font-semibold text-green-700">Registration Successful!</span>
          </div>
          <p className="text-gray-700"><span className="font-semibold">Username:</span> {username}</p>
          <p className="text-gray-700 mt-2"><span className="font-semibold">Password:</span> {password}</p>
        </div>
      )}

      {/* Display registration message (success or error) */}
      {message && (
        <div
          className={`mt-6 p-4 rounded-md flex items-center ${
            message.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
            'bg-red-100 border border-red-400 text-red-700'
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
