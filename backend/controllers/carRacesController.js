// controllers/carRacesController.js
const Car = require('../models/Car'); // Assuming you have a Car model

// Fetch cars for races
exports.getRaceCars = async (req, res) => {
  try {
    const cars = await Car.find(); // Assuming you have a Car model
    res.json(cars);
  } catch (error) {
    console.error('Error fetching cars for races:', error);
    res.status(500).json({ error: 'Failed to fetch race cars' });
  }
};
