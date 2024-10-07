const express = require('express');
const router = express.Router();
const carTheftController = require('../controllers/carTheftController');

// No need for authMiddleware
router.get('/data', carTheftController.getCarTheftData);
router.post('/steal', carTheftController.stealCar);

module.exports = router;