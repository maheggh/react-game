const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserData, updateUserData, getJailTime } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerUser);  
router.post('/login', loginUser);        

// Protected routes
router.get('/profile', authMiddleware, getUserData);
router.post('/update', authMiddleware, updateUserData);
router.get('/jail-time', authMiddleware, getJailTime);

module.exports = router;
