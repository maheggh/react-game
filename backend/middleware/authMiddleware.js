const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization'); // Get the authorization header
  const token = authHeader && authHeader.startsWith('Bearer') ? authHeader.split(' ')[1] : authHeader;

  if (!token) {
    return res.status(401).json({ message: 'Authorization denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET); // Verify the token with the correct secret
    req.user = decoded; // Attach decoded user info to request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Invalid token:', error.message);
    res.status(401).json({ message: 'Invalid token. Please login again.' });
  }
};

module.exports = authMiddleware;
