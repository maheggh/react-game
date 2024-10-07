// routes/carRoutes.js
const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController'); // Ensure this is correct

// Route for fetching cars
router.get('/', carController.getCarsInventory); // This should map to the controller method

module.exports = router;
