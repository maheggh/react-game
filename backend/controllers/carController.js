// controllers/carController.js
const Car = require('../models/Car'); 

// Fetch all cars
exports.getCarsInventory = async (req, res) => {
  try {
    const cars = await Car.find(); // Assuming you have a Car model
    res.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
};
