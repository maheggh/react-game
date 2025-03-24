import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  FaUser,
  FaLock,
  FaSignInAlt,
  FaExclamationCircle,
  FaCheckCircle
} from 'react-icons/fa';

const Login = () => {
  // Access the 'login' method from your AuthContext
  const { login } = useContext(AuthContext);

  // Component states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validate and call the 'login' from context
  const handleLogin = async () => {
    if (!username || !password) {
      setMessage({ type: 'error', text: 'Username and password are required.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // AuthContext's "login" should handle the fetch with credentials: 'include'
      const success = await login(username, password);
      if (success) {
        setMessage({ type: 'success', text: 'Login successful!' });
      } else {
        setMessage({ type: 'error', text: 'Invalid credentials' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred during login.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-center mb-6">
        <FaSignInAlt className="text-blue-500 mr-2" size={32} />
        <h2 className="text-2xl font-bold text-gray-800">Login</h2>
      </div>

      {/* Username Field */}
      <div className="mb-4">
        <label htmlFor="username" className="block text-gray-700 font-semibold mb-2">
          Username:
        </label>
        <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
          <FaUser className="text-gray-500 mr-2" />
          <input
            type="text"
            id="username"
            className="w-full bg-gray-100 outline-none text-gray-700"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
          Password:
        </label>
        <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
          <FaLock className="text-gray-500 mr-2" />
          <input
            type="password"
            id="password"
            className="w-full bg-gray-100 outline-none text-gray-700"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Login Button */}
      <button
        onClick={handleLogin}
        className={`w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : (
          <>
            <FaSignInAlt className="mr-2" />
            Login
          </>
        )}
      </button>

      {/* Status Message */}
      {message && (
        <div
          className={`mt-4 p-4 rounded-md flex items-center ${
            message.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}
          role="alert"
        >
          {message.type === 'success' ? (
            <FaCheckCircle className="mr-2" />
          ) : (
            <FaExclamationCircle className="mr-2" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
};

export default Login;
