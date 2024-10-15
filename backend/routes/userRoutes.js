// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes
router.get('/profile', authMiddleware, userController.getUserData); // Corrected line
router.post('/update', authMiddleware, userController.updateUserData);
router.get('/jail-time', authMiddleware, userController.getJailTime);

module.exports = router;
