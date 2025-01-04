const express = require('express');
const router = express.Router();
const carTheftController = require('../controllers/carTheftController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/venues', authMiddleware, carTheftController.getVenues);
router.post('/steal', authMiddleware, carTheftController.stealCar);
router.post('/sell', authMiddleware, carTheftController.sellCar);

module.exports = router;
