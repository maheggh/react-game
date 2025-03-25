const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateRandomGangsterName, generateRandomPassword } = require('../utils/nameGenerator');
const { getRankForXp } = require('../utils/rankCalculator');

exports.registerUser = async (req, res) => {
  try {
    let { username, password } = req.body;
    if (!username) {
      username = generateRandomGangsterName();
    }
    if (!password) {
      password = generateRandomPassword();
    }
    const rawPassword = password;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      isAlive: true,
      xp: 0,
      rank: 'Homeless Potato',
      money: 0,
      cars: [],
      stolenItems: [],
      inventory: [],
      bossItems: [],
      kills: 0
    });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id.toString() }, process.env.TOKEN_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    });
    return res.status(201).json({
      success: true,
      userData: {
        userId: newUser._id.toString(),
        username: newUser.username,
        password: rawPassword,
        message: 'User registered successfully'
      }
    });
    console.log('Saved user to DB. ID:', newUser._id);
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ success: false, message: 'Failed to register user' });
  }
};

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
    const token = jwt.sign({ userId: user._id.toString() }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 1000
    });
    return res.json({
      success: true,
      userData: {
        userId: user._id.toString(),
        username: user.username,
        money: user.money,
        cars: user.cars,
        stolenItems: user.stolenItems,
        inventory: user.inventory,
        bossItems: user.bossItems,
        xp: user.xp,
        rank: user.rank,
        isAlive: user.isAlive,
        kills: user.kills
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ success: false, message: 'Failed to login user' });
  }
};

exports.logoutUser = (req, res) => {
  try {
    res.clearCookie('token');
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out user:', error);
    return res.status(500).json({ success: false, message: 'Failed to logout user' });
  }
};

exports.getUserData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const rankInfo = getRankForXp(user.xp);
    return res.json({
      success: true,
      userData: {
        userId: user._id.toString(),
        username: user.username,
        money: user.money,
        cars: user.cars,
        stolenItems: user.stolenItems,
        inventory: user.inventory,
        bossItems: user.bossItems,
        xp: user.xp,
        rank: rankInfo.currentRank,
        nextRank: rankInfo.nextRank,
        nextRankThreshold: rankInfo.nextRankThreshold,
        currentRankThreshold: rankInfo.currentRankThreshold,
        isAlive: user.isAlive,
        kills: user.kills
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user data' });
  }
};

exports.updateUserData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updatedData = req.body;
    const allowedUpdates = [
      'money', 'inJail', 'jailTimeEnd', 'xp', 'rank', 'isAlive', 'kills', 'cars',
      'stolenItems', 'inventory', 'bossItems'
    ];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (field in updatedData) {
        updates[field] = updatedData[field];
      }
    });
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, message: 'User data updated', user });
  } catch (error) {
    console.error('Error updating user data:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user data', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const rankInfo = getRankForXp(user.xp);
    return res.json({
      success: true,
      userData: {
        userId: user._id.toString(),
        username: user.username,
        money: user.money,
        cars: user.cars,
        stolenItems: user.stolenItems,
        inventory: user.inventory,
        bossItems: user.bossItems,
        xp: user.xp,
        rank: rankInfo.currentRank,
        kills: user.kills,
        nextRank: rankInfo.nextRank,
        nextRankThreshold: rankInfo.nextRankThreshold,
        currentRankThreshold: rankInfo.currentRankThreshold,
        isAlive: user.isAlive
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user data' });
  }
};
