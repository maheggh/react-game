const User = require('../models/User');

// Add a car to the user's garage
exports.addCarToGarage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { car } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cars.push(car);
    await user.save();

    res.status(200).json({ message: 'Car added to garage', cars: user.cars });
  } catch (error) {
    console.error('Error adding car to garage:', error);
    res.status(500).json({ message: 'Failed to add car to garage' });
  }
};

// Remove a car from the user's garage
exports.removeCarFromGarage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { carName } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const carIndex = user.cars.findIndex((car) => car.name === carName);
    if (carIndex === -1) {
      return res.status(400).json({ message: 'Car not found in garage' });
    }

    user.cars.splice(carIndex, 1);
    await user.save();

    res.status(200).json({ message: 'Car removed from garage', cars: user.cars });
  } catch (error) {
    console.error('Error removing car from garage:', error);
    res.status(500).json({ message: 'Failed to remove car from garage' });
  }
};
