const User = require('../models/User'); 
const Car = require('../models/Car'); 

// Fetch theft-related data
exports.getCarTheftData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id); 
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user); // Send user data to the frontend
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

// Handle stealing a car
exports.stealCar = async (req, res) => {
  const { venue } = req.body;
  
  try {
    const user = await User.findById(req.user._id); 

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate success rate based on user's current success rate
    const success = Math.random() * 100 < user.carTheftSuccessRate;

    if (success) {
      const availableCars = await Car.find();
      const randomCar = availableCars[Math.floor(Math.random() * availableCars.length)];

      // Add the car to the user's inventory
      user.cars.push(randomCar);
      user.money += randomCar.price; 
      user.crimesPerformed += 1; 
      await user.save();

      res.json({ success: true, car: randomCar });
    } else {
      res.json({ success: false, message: 'You got caught and sent to jail!' });
    }
  } catch (error) {
    console.error('Error during car theft:', error);
    res.status(500).json({ error: 'Failed to steal car' });
  }
};
