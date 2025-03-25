const User = require('../models/User');
const { getRankForXp } = require('../utils/rankCalculator');
const { startJailTime, checkAndReleaseUser } = require('./jailController');

const THEFT_ITEMS = {
  Purse: [
    { name: 'Slim Purse', price: 50, baseChance: 40 },
    { name: 'Fat Purse', price: 200, baseChance: 25 }
  ],
  Jewelry: [
    { name: 'Diamond', price: 5000, baseChance: 10 },
    { name: 'Ruby', price: 3000, baseChance: 15 }
  ],
  ATM: [
    { name: 'ATM Money', price: 1000, baseChance: 30 }
  ],
  Bank: [
    { name: 'Bank Money', price: 50000, baseChance: 5 }
  ]
};

exports.getStolenItems = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await checkAndReleaseUser(user);
    const jailTimeLeft = user.inJail ? Math.max(0, user.jailTimeEnd - Date.now()) : 0;
    return res.json({
      stolenItems: user.stolenItems || [],
      inJail: user.inJail,
      jailTime: Math.ceil(jailTimeLeft / 1000)
    });
  } catch (error) {
    console.error('Error fetching stolen items:', error.message);
    return res.status(500).json({ message: 'Server error fetching stolen items' });
  }
};

exports.stealItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await checkAndReleaseUser(user);
    if (user.inJail) {
      return res.status(403).json({
        message: 'You cannot steal while in jail!',
        inJail: true,
        jailTime: Math.ceil((user.jailTimeEnd - Date.now()) / 1000)
      });
    }
    const items = THEFT_ITEMS[category];
    if (!items) {
      return res.status(400).json({ message: 'Invalid theft category' });
    }
    const selectedItem = pickRandomItem(items);
    const success = attemptTheft(selectedItem, user);
    if (success) {
      return res.status(200).json({
        message: `You successfully stole a ${selectedItem.name}!`,
        stolenItem: selectedItem,
        xp: user.xp,
        rank: user.rank
      });
    } else {
      return res.status(403).json({
        message: 'You got caught and sent to jail!',
        inJail: true,
        jailTime: Math.ceil((user.jailTimeEnd - Date.now()) / 1000)
      });
    }
  } catch (error) {
    console.error('Error during theft:', error.message);
    return res.status(500).json({ message: 'Server error during theft' });
  }
};

exports.sellItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemName } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const index = user.stolenItems.findIndex(i => i.name === itemName);
    if (index === -1) {
      return res.status(400).json({ message: 'Item not found in your pocket' });
    }
    const stolenItem = user.stolenItems[index];
    user.money += stolenItem.price;
    user.stolenItems.splice(index, 1);
    await user.save();
    return res.status(200).json({
      message: `You sold ${stolenItem.name} for $${stolenItem.price}`,
      money: user.money
    });
  } catch (error) {
    console.error('Error selling item:', error.message);
    return res.status(500).json({ message: 'Server error during sale' });
  }
};

function attemptTheft(item, user) {
  const level = user.level || 1;
  const chance = Math.min(item.baseChance + level * 5, 90);
  const roll = Math.floor(Math.random() * 100) + 1;
  if (roll <= chance) {
    user.stolenItems.push(item);
    user.xp += 100;
    user.rank = getRankForXp(user.xp).currentRank;
    user.save();
    return true;
  } else {
    const jailDuration = 30;
    require('./jailController').startJailTime(user, jailDuration);
    return false;
  }
}

function pickRandomItem(items) {
  let totalChance = 0;
  for (const i of items) {
    totalChance += i.baseChance;
  }
  let randomNum = Math.random() * totalChance;
  for (const i of items) {
    if (randomNum < i.baseChance) {
      return i;
    }
    randomNum -= i.baseChance;
  }
  return items[items.length - 1];
}
