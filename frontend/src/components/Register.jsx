import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { login, isLoggedIn } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/userstatus'); // Redirect to UserStatus if already logged in
    }
  }, [isLoggedIn, navigate]);

  const registerUser = async () => {
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (response.ok) {
        setUsername(data.username);
        setPassword(data.password);

        // Store password in localStorage so it can be retrieved later
        localStorage.setItem('password', data.password);

        setMessage('User registered successfully!');

        if (data.token) {
          login(data.token); 
          navigate('/'); 
        }
      } else {
        setMessage(`Failed to register user: ${data.message}`);
      }
    } catch (error) {
      setMessage('Error registering user');
    }
  };

  return (
    <div>
      <h2>Register to Play</h2>
      <button onClick={registerUser}>
        Generate Random Gangster Name
      </button>
      {username && (
        <div>
          <p>Username: {username}</p>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;
