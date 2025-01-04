const express = require('express');
const router = express.Router();
const carTheftController = require('../controllers/carTheftController');
const authMiddleware = require('../middleware/authMiddleware');

// Steal a car
router.post('/steal', authMiddleware, carTheftController.stealCar);

// Sell a car
router.post('/sell', authMiddleware, carTheftController.sellCar);

module.exports = router;