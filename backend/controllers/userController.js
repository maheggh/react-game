const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateRandomGangsterName, generateRandomPassword } = require('../utils/nameGenerator'); // Import name generator

// Register User
exports.registerUser = async (req, res) => {
  try {
    // Generate random gangster username and password
    const randomUsername = generateRandomGangsterName();
    const randomPassword = generateRandomPassword();

    // Hash the generated password
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create new user with random credentials
    const newUser = new User({
      username: randomUsername,
      password: hashedPassword,
      money: 0, // Set default money
      cars: [], // Initialize cars array
      stolenItems: [], // Initialize stolenItems array
      inventory: [], // Initialize inventory for new user
      bossItems: [], // Initialize bossItems for new user
    });

    // Save the new user to the database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.TOKEN_SECRET, {
      expiresIn: '24h',
    });

    // Respond with generated username, password, and token
    res.status(201).json({
      success: true,
      token,
      username: randomUsername,  // Send back generated username
      password: randomPassword,  // Send back generated password
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

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare provided password with hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: '1h',
    });

    // Respond with user data and token
    res.json({
      success: true,
      token,
      userData: {
        username: user.username,
        money: user.money,
        cars: user.cars,
        stolenItems: user.stolenItems,
        inventory: user.inventory,  // Include inventory in response
        bossItems: user.bossItems,  // Include bossItems in response
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

    // Respond with user data
    res.json({
      success: true,
      userData: {
        username: user.username,
        money: user.money,
        cars: user.cars,
        stolenItems: user.stolenItems,
        inventory: user.inventory,  // Include inventory in response
        bossItems: user.bossItems,  // Include bossItems in response
      },
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
};

// Update User Data (to handle rank progression)
exports.updateUserData = async (req, res) => {
  try {
    const { money, cars, stolenItems, inventory, bossItems, missionsCompleted } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (money !== undefined) user.money = money;
    if (cars !== undefined) user.cars = cars;
    if (stolenItems !== undefined) user.stolenItems = stolenItems;
    if (inventory !== undefined) user.inventory = inventory;
    if (bossItems !== undefined) user.bossItems = bossItems;
    if (missionsCompleted !== undefined) user.missionsCompleted = missionsCompleted;

    // Calculate new rank based on missionsCompleted (e.g., rank up every 10 missions)
    if (missionsCompleted !== undefined) {
      user.rank = Math.floor(missionsCompleted / 10) + 1; // Adjust rank as needed
    }

    await user.save();

    res.json({
      success: true,
      userData: {
        username: user.username,
        money: user.money,
        cars: user.cars,
        stolenItems: user.stolenItems,
        inventory: user.inventory,
        bossItems: user.bossItems,
        missionsCompleted: user.missionsCompleted,
        rank: user.rank, // Send updated rank back
      },
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: 'Failed to update user data' });
  }
};
