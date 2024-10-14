const User = require('../models/User');
const { getRankForXp } = require('../utils/rankCalculator'); // Import rank calculator

// Steal an item
exports.stealItem = async (req, res) => {
  try {
    const { userId } = req.user; // Authenticated user ID
    const { itemType } = req.body; // Expecting an item type (e.g., Purse, Jewelry)

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if the user is in jail
    if (user.inJail) {
      return res.status(403).json({ message: 'You cannot steal while in jail!' });
    }

    // Define available items
    const items = {
      'Purse': [
        { name: 'Slim Purse', price: 50, baseChance: 40, image: '/assets/slim-purse.png' },
        { name: 'Fat Purse', price: 200, baseChance: 25, image: '/assets/fat-purse.png' }
      ],
      'Jewelry': [
        { name: 'Diamond', price: 5000, baseChance: 10, image: '/assets/diamond.png' },
        { name: 'Ruby', price: 3000, baseChance: 15, image: '/assets/ruby.png' }
      ],
      'ATM': [
        { name: 'ATM Money', price: 1000, baseChance: 30, image: '/assets/atm.png' }
      ],
      'Bank': [
        { name: 'Bank Money', price: 50000, baseChance: 5, image: '/assets/bank.png' }
      ]
    };

    const availableItems = items[itemType];
    if (!availableItems) return res.status(400).json({ message: 'Invalid item type' });

    // Randomly select an item to steal
    const selectedItem = getRandomItem(availableItems);

    // Calculate steal chance (using baseChance instead of chance)
    const stealChance = Math.max(Math.min(selectedItem.baseChance + user.level * 5, 90), 20); // Adjusted chance

    // Simulate the theft (random roll)
    const roll = Math.floor(Math.random() * 100) + 1;
    console.log(`Steal chance: ${stealChance}, Roll: ${roll}`); // Log chance and roll
    if (roll <= stealChance) {
      // Successful theft
      user.stolenItems.push(selectedItem);

      // Gain XP and update rank
      const xpGained = 50;
      user.xp += xpGained;
      user.rank = getRankForXp(user.xp); // Update rank based on XP

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
      user.jailTime = 30; // Set jail time (e.g., 30 seconds)
      await user.save();

      return res.status(403).json({
        message: 'You got caught and sent to jail!',
        inJail: true,
        jailTime: user.jailTime,
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
