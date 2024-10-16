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
      username = generateRandomGangsterName();
    }
    if (!password) {
      password = generateRandomPassword();
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      isAlive: true, // Ensure the user starts alive
      xp: 0,
      rank: 'Homeless Potato',
      money: 0,
      cars: [],
      stolenItems: [],
      inventory: [],
      bossItems: [],
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.TOKEN_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      success: true,
      token,
      userData: {
        username: newUser.username,
        password, // Include password in response for display
        message: 'User registered successfully',
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
};

// Login User Function
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      success: true,
      token,
      userData: {
        _id: user._id,
        username: user.username,
        money: user.money,
        cars: user.cars,
        stolenItems: user.stolenItems,
        inventory: user.inventory,
        bossItems: user.bossItems,
        xp: user.xp,
        rank: user.rank,
        isAlive: user.isAlive,
      },
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ success: false, message: 'Failed to login user' });
  }
};


// Get User Data Function
exports.getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate the rank and next rank details
    const rankInfo = getRankForXp(user.xp); // Ensure this function is correctly implemented

    res.json({
      success: true,
      userData: {
        _id: user._id,
        username: user.username,
        money: user.money,
        cars: user.cars,
        stolenItems: user.stolenItems,
        inventory: user.inventory,
        bossItems: user.bossItems,
        xp: user.xp, // Current XP
        rank: rankInfo.currentRank, // Current rank
        nextRank: rankInfo.nextRank, // Next rank
        nextRankThreshold: rankInfo.nextRankThreshold, // XP needed for next rank
        currentRankThreshold: rankInfo.currentRankThreshold, // XP threshold for current rank
        isAlive: user.isAlive, // Include isAlive
      },
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user data' });
  }
};

// Update User Data Function
exports.updateUserData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updatedData = req.body;

    // Validate and sanitize updatedData as needed
    const allowedUpdates = ['money', 'inJail', 'jailTimeEnd', 'xp', 'rank'];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (field in updatedData) {
        updates[field] = updatedData[field];
      }
    });

    // Update the user data
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User data updated', user });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ success: false, message: 'Failed to update user data', error: error.message });
  }
};
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Calculate the rank and next rank details
    const rankInfo = getRankForXp(user.xp);

    res.json({
      success: true,
      userData: {
        _id: user._id,
        username: user.username,
        money: user.money,
        cars: user.cars,
        stolenItems: user.stolenItems,
        inventory: user.inventory,
        bossItems: user.bossItems,
        xp: user.xp, // Current XP
        rank: rankInfo.currentRank, // Current rank
        nextRank: rankInfo.nextRank, // Next rank
        nextRankThreshold: rankInfo.nextRankThreshold, // XP needed for next rank
        currentRankThreshold: rankInfo.currentRankThreshold, // XP threshold for current rank
        isAlive: user.isAlive, // Include isAlive
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user data' });
  }
};
exports.startJailTime = async (user, jailDurationInSeconds) => {
  user.inJail = true;
  const jailTimeEnd = Date.now() + jailDurationInSeconds * 1000; // Store the future release time in milliseconds
  user.jailTimeEnd = jailTimeEnd;
  await user.save();
};
exports.getJailTime = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.inJail) {
      return res.status(200).json({ inJail: false, message: 'User is not in jail' });
    }

    const jailTimeLeft = Math.max(0, user.jailTimeEnd.getTime() - Date.now());
    if (jailTimeLeft > 0) {
      return res.status(200).json({
        inJail: true,
        jailTime: Math.ceil(jailTimeLeft / 1000), // Return time in seconds
      });
    } else {
      // Release user if jail time is up
      user.inJail = false;
      user.jailTimeEnd = null;
      await user.save();
      return res.status(200).json({ inJail: false, message: 'User has been released from jail' });
    }
  } catch (error) {
    console.error('Error fetching jail time:', error.message);
    return res.status(500).json({
      message: 'Server error fetching jail time',
      error: error.message,
    });
  }
};
exports.updateMoney = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { money } = req.body;

    const user = await User.findById(userId);

    if (money < 0) {
      return res.status(400).json({ success: false, message: 'Money cannot be negative.' });
    }

    user.money = money;
    await user.save();

    res.status(200).json({ success: true, money: user.money });
  } catch (error) {
    console.error('Error updating money:', error);
    res.status(500).json({ success: false, message: 'Server error updating money' });
  }
};
exports.getTargets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const users = await User.find({ _id: { $ne: userId }, isAlive: true }).select('username level xp _id');

    res.status(200).json({ success: true, targets: users });
  } catch (error) {
    console.error('Error fetching targets:', error);
    res.status(500).json({ success: false, message: 'Error fetching targets' });
  }
};