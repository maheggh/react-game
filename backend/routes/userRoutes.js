const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserData, updateUserData } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerUser);  
router.post('/login', loginUser);        

// Protected routes
router.get('/profile', authMiddleware, getUserData);
router.post('/update', authMiddleware, updateUserData);

module.exports = router;
