// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Read the cookie named "token"
  const token = req.cookies.token;
  if (!token) {
    console.error('No token provided in cookie');
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decoded; // e.g. { userId: '...' }
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
