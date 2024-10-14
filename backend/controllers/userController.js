const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateRandomGangsterName, generateRandomPassword } = require('../utils/nameGenerator');
const { getRankForXp } = require('../utils/rankCalculator');

exports.registerUser = async (req, res) => {
  try {
    let { username, password } = req.body;

    // If username or password is missing, generate random ones
    if (!username) {
      username = generateRandomGangsterName(); // Generate random gangster name
    }
    if (!password) {
      password = generateRandomPassword(); // Generate random password
    }

    // Log the generated username and password for debugging
    console.log('Generated Username:', username);
    console.log('Generated Password:', password); // Debugging

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      money: 0,
      cars: [],
      stolenItems: [],
      inventory: [],
      bossItems: [],
      rank: 'Beginner',
      xp: 0
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.TOKEN_SECRET, {
      expiresIn: '24h',
    });

    // Log the response being sent back for debugging
    console.log('Returning Response:', { username, password });

    res.status(201).json({
      success: true,
      token,
      userData: {
        username: newUser.username,
        password,  // Include password in response for display
        message: 'User registered successfully',
      },
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
        inventory: user.inventory,
        bossItems: user.bossItems,
        xp: user.xp, 
        rank: user.rank,
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
        inventory: user.inventory,
        bossItems: user.bossItems,
        xp: user.xp, 
        rank: user.rank,
      },
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
};

exports.updateUserData = async (req, res) => {
  try {
    const { money, stolenItems, xpToAdd } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update money and stolen items if provided
    if (money !== undefined) user.money = money;
    if (stolenItems !== undefined) user.stolenItems = stolenItems;

    // Update XP and calculate new rank
    if (xpToAdd) {
      user.xp += xpToAdd;  // Add XP
      user.rank = getRankForXp(user.xp);  // Recalculate the rank based on new XP
    }

    // Save the updated user data in the database
    await user.save();

    res.json({
      success: true,
      userData: {
        username: user.username,
        money: user.money,
        stolenItems: user.stolenItems,
        xp: user.xp,  
        rank: user.rank,  
      },
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: 'Failed to update user data' });
  }
};