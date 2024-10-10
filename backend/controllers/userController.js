const User = require('../models/User'); // Import the User model
const bcrypt = require('bcryptjs'); // Assuming bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Assuming jwt for token generation

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      money: 0, // Set default money and any other default fields here
      cars: [],
      stolenItems: [],
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.TOKEN_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({
      success: true,
      token,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      success: true,
      token,
      userData: {
        username: user.username,
        money: user.money,
        cars: user.cars,
        stolenItems: user.stolenItems,
      },
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Failed to login user' });
  }
};

// Get User Data (Protected Route)
exports.getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      userData: {
        username: user.username,
        money: user.money,
        cars: user.cars,
        stolenItems: user.stolenItems,
      },
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
};

// Update User Data
exports.updateUserData = async (req, res) => {
  try {
    const { money, cars, stolenItems } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (money !== undefined) user.money = money;
    if (cars !== undefined) user.cars = cars;
    if (stolenItems !== undefined) user.stolenItems = stolenItems;

    await user.save();

    res.json({
      success: true,
      userData: {
        username: user.username,
        money: user.money,
        cars: user.cars,
        stolenItems: user.stolenItems,
      },
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: 'Failed to update user data' });
  }
};
