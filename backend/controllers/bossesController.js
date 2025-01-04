const User = require('../models/User');
const { getRankForXp } = require('../utils/rankCalculator');

exports.fightBoss = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bossName, weaponName, bulletsUsed } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, message: 'Fight boss logic here.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fighting boss.' });
  }
};

exports.updateBossItems = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bossItems } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    user.bossItems = bossItems;
    await user.save();
    return res.json({ success: true, bossItems: user.bossItems });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating boss items.' });
  }
};

exports.updateMoney = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { money } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    user.money = money;
    await user.save();
    return res.json({ success: true, money: user.money });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating money.' });
  }
};

exports.updateXP = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { xp } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    user.xp = xp;
    user.rank = getRankForXp(xp).currentRank;
    await user.save();
    return res.json({ success: true, xp: user.xp, rank: user.rank });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating XP.' });
  }
};
