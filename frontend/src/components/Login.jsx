import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      // Ensure username and password are included in the request body
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }), // Make sure username and password are passed correctly
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.message}`);
        return;
      }

      if (data.token) {
        login(data.token); // Store the token in the context
        setMessage('Login successful!');
      } else {
        setMessage('Invalid credentials');
      }
    } catch (error) {
      setMessage('Error during login');
    }
  };

  return (
    <div className='grid justify-left p-5'>
      <label htmlFor="username">Username:</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className='p-4'
      />
      <label htmlFor="Password">Password:</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className='p-4'
      />
      <button onClick={handleLogin} className='bg-gray-200 w-20 rounded-lg'>Login</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
