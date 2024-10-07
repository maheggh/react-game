const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserData } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', registerUser);  // Ensure this is correct
router.post('/login', loginUser);        // Ensure this is correct

// Protected Route
router.get('/profile', authMiddleware, getUserData);  // Ensure this is correct

module.exports = router;
