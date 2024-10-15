// routes/carRacesRoutes.js

const express = require('express');
const router = express.Router();
const carRacesController = require('../controllers/carRacesController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/addCar', authMiddleware, carRacesController.addCarToGarage);
router.post('/removeCar', authMiddleware, carRacesController.removeCarFromGarage);

module.exports = router;