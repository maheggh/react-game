const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateRandomGangsterName, generateRandomPassword } = require('../utils/nameGenerator');

// Register User
// Backend - userController.js
exports.registerUser = async (req, res) => {
  let username, password, existingUser;
  try {
    // Generate random gangster name and password
    do {
      username = generateRandomGangsterName();
      existingUser = await User.findOne({ username });
    } while (existingUser);
    
    password = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      level: 1,
      rank: 'Beginner',
      money: 0,
      cars: [],
      crimesPerformed: 0,
      assassinationSuccessRate: 5,
      carTheftSuccessRate: 10,
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      process.env.TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    // Respond with the plain password (unhashed) for testing
    res.status(201).json({
      success: true,
      username: newUser.username,
      password, // plain password here
      token,
      message: 'User registered successfully!',
    });

  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ success: false, message: 'Failed to register user', error: error.message });
  }
};


exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  // Ensure username and password are provided
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both username and password' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.error('Login failed: Username not found');
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    // Debugging logs
    console.log(`Checking password for user: ${username}`);
    console.log(`Entered password: ${password}`);
    console.log(`Hashed password in DB: ${user.password}`);

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.error(`Password does not match for user: ${username}`);
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      userData: {
        username: user.username,
        level: user.level,
        rank: user.rank,
        money: user.money,
        cars: user.cars,
        crimesPerformed: user.crimesPerformed,
        assassinationSuccessRate: user.assassinationSuccessRate,
        carTheftSuccessRate: user.carTheftSuccessRate,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};


// Get User Data (Protected Route)
exports.getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      userData: {
        username: user.username,
        level: user.level,
        rank: user.rank,
        money: user.money,
        cars: user.cars,
        crimesPerformed: user.crimesPerformed,
        assassinationSuccessRate: user.assassinationSuccessRate,
        carTheftSuccessRate: user.carTheftSuccessRate,
      },
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};