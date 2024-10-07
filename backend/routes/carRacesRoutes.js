// routes/carRaceRoutes.js
const express = require('express');
const router = express.Router();
const carRacesController = require('../controllers/carRacesController'); 

// Define routes and map them to controller functions
router.get('/racecars', carRacesController.getRaceCars); // Route maps to getRaceCars function

module.exports = router;
