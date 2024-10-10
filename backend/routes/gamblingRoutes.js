const express = require('express');
const router = express.Router();
const gamblingController = require('../controllers/gamblingController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to handle spinning the wheel
router.post('/spin', authMiddleware, gamblingController.spinWheel);

module.exports = router;