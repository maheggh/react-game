import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { login, isLoggedIn } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  // Generate random username and password on the backend
  const registerUser = async () => {
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})  // Sending an empty body; the backend will generate username/password
      });

      const data = await response.json();

      if (response.ok) {
        setUsername(data.userData.username);  // Set the generated username
        setPassword(data.userData.password);  // Set the generated password

        // Store password locally (useful for the user to see their password)
        localStorage.setItem('password', data.userData.password);

        setMessage('User registered successfully!');

        if (data.token) {
          login(data.token);  // Automatically log the user in after registration
          navigate('/');  // Redirect to user status page
        }
      } else {
        setMessage(`Failed to register user: ${data.message}`);
      }
    } catch (error) {
      console.error('Error registering user:', error);
      setMessage('Error registering user');
    }
  };

  return (
    <div>
      <h2>Register to Play</h2>
      
      {/* Button to generate random username and password */}
      <button onClick={registerUser}>Generate Random Gangster Name</button>

      {/* Display the generated username and password */}
      {username && (
        <div>
          <p><strong>Username:</strong> {username}</p>
          <p><strong>Password:</strong> {password}</p>
        </div>
      )}

      {/* Display registration message (success or error) */}
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;
