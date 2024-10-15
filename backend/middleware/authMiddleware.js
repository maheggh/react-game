// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('Authorization Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Missing or invalid Authorization header');
    return res.status(403).json({ message: 'Authorization denied. Invalid or missing token.' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token:', token);

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log('Decoded Token:', decoded);
    req.user = { userId: decoded.userId }; // Ensure req.user.userId is set
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(403).json({ message: 'Token verification failed. Please login again.' });
  }
};

module.exports = authMiddleware;
