const User = require('../models/User');
const { getRankForXp } = require('../utils/rankCalculator');

// Steal an item
exports.stealItem = async (req, res) => {
  try {
    const { userId } = req.user;
    const { itemType } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.inJail) {
      return res.status(403).json({ message: 'You cannot steal while in jail!' });
    }

    const items = {
      'Purse': [
        { name: 'Slim Purse', price: 50, baseChance: 40 },
        { name: 'Fat Purse', price: 200, baseChance: 25 }
      ],
      'Jewelry': [
        { name: 'Diamond', price: 5000, baseChance: 10 },
        { name: 'Ruby', price: 3000, baseChance: 15 }
      ],
      'ATM': [
        { name: 'ATM Money', price: 1000, baseChance: 30 }
      ],
      'Bank': [
        { name: 'Bank Money', price: 50000, baseChance: 5 }
      ]
    };

    const availableItems = items[itemType];
    if (!availableItems) return res.status(400).json({ message: 'Invalid item type' });

    const selectedItem = getRandomItem(availableItems);
    const stealChance = Math.min(selectedItem.baseChance + user.level * 5, 90);
    const roll = Math.floor(Math.random() * 100) + 1;

    if (roll <= stealChance) {
      // Successful theft
      user.stolenItems.push(selectedItem);
      const xpGained = 100;
      user.xp += xpGained;
      user.rank = getRankForXp(user.xp).currentRank;

      await user.save();

      return res.status(200).json({
        message: `You successfully stole a ${selectedItem.name}!`,
        stolenItem: selectedItem,
        xp: user.xp,
        rank: user.rank,
      });
    } else {
      // Failed theft - Send to jail
      user.inJail = true;
      const jailTime = 30 * 1000; // 30 seconds in milliseconds
      user.jailTimeEnd = Date.now() + jailTime; // Set jail time end based on current timestamp
      await user.save();

      return res.status(403).json({
        message: 'You got caught and sent to jail!',
        inJail: true,
        jailTime: Math.ceil(jailTime / 1000), // Send jail time in seconds
      });
    }
  } catch (error) {
    console.error('Error during theft:', error.message);
    return res.status(500).json({ message: 'Server error during theft', error: error.message });
  }
};


// Sell stolen item
exports.sellItem = async (req, res) => {
  try {
    const { userId } = req.user;
    const { itemName } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const itemIndex = user.stolenItems.findIndex((item) => item.name === itemName);
    if (itemIndex === -1) return res.status(400).json({ message: 'Item not found in pocket' });

    const stolenItem = user.stolenItems[itemIndex];
    user.money += stolenItem.price;
    user.stolenItems.splice(itemIndex, 1);

    await user.save();
    return res.status(200).json({
      message: `You sold ${stolenItem.name} for $${stolenItem.price}`,
      money: user.money,
    });
  } catch (error) {
    console.error('Error selling item:', error.message);
    return res.status(500).json({ message: 'Server error during sale', error: error.message });
  }
};

// Helper function to get random item based on chance
const getRandomItem = (items) => {
  let totalChance = items.reduce((sum, item) => sum + item.baseChance, 0); // Use baseChance here
  let randomNum = Math.random() * totalChance;
  for (let item of items) {
    if (randomNum < item.baseChance) {
      return item;
    }
    randomNum -= item.baseChance;
  }
  return items[items.length - 1];
};
