const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Steal an item
exports.stealItem = async (req, res) => {
  try {
    const { userId } = req.user; // User should be authenticated
    const { itemType } = req.body; // Expecting an item type (e.g., Purse, Jewel)

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.inJail) {
      return res.status(403).json({ message: 'You cannot steal while in jail!' });
    }

    const items = {
      Purse: [
        { name: 'Fat Purse', price: 200, chance: 30, image: '/assets/fat-purse.png' },
        { name: 'Regular Purse', price: 100, chance: 40, image: '/assets/regular-purse.png' },
        { name: 'Slim Purse', price: 50, chance: 50, image: '/assets/slim-purse.png' },
        { name: 'Empty Purse', price: 0, chance: 60, image: '/assets/empty-purse.png' },
      ],
      Jewel: [
        { name: 'Diamond', price: 5000, chance: 10, image: '/assets/diamond.png' },
        { name: 'Ruby', price: 3000, chance: 15, image: '/assets/ruby.png' },
        { name: 'Emerald', price: 2000, chance: 20, image: '/assets/emerald.png' },
        { name: 'Sapphire', price: 1000, chance: 25, image: '/assets/sapphire.png' },
      ],
      Bank: [{ name: 'Bank Money', price: 50000, chance: 5, image: '/assets/bank.png' }],
      ATM: [{ name: 'ATM Money', price: 1000, chance: 30, image: '/assets/atm.png' }],
    };

    const availableItems = items[itemType];
    if (!availableItems) return res.status(400).json({ message: 'Invalid item type' });

    const selectedItem = getRandomItem(availableItems);

    const stealChance = Math.min(selectedItem.chance + user.level * 2, 90); // Adjust steal chance based on user level

    const roll = Math.floor(Math.random() * 100) + 1;
    if (roll <= stealChance) {
      // Successful theft
      user.stolenItems.push(selectedItem);
      await user.save();
      return res.status(200).json({
        message: `You successfully stole a ${selectedItem.name}!`,
        stolenItem: selectedItem,
      });
    } else {
      // Failed theft
      return res.status(403).json({ message: 'You failed to steal the item!' });
    }
  } catch (error) {
    console.error('Error during theft:', error.message);
    return res.status(500).json({ message: 'Server error during theft', error: error.message });
  }
};

// Sell stolen item
exports.sellItem = async (req, res) => {
  try {
    const { userId } = req.user; // User should be authenticated
    const { itemName } = req.body; // Expecting an item name to sell

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const itemIndex = user.stolenItems.findIndex((item) => item.name === itemName);
    if (itemIndex === -1) return res.status(400).json({ message: 'Item not found in pocket' });

    const stolenItem = user.stolenItems[itemIndex];
    user.money += stolenItem.price; // Add the item value to user's money
    user.stolenItems.splice(itemIndex, 1); // Remove the item from pocket

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
  let totalChance = items.reduce((sum, item) => sum + item.chance, 0);
  let randomNum = Math.random() * totalChance;
  for (let item of items) {
    if (randomNum < item.chance) {
      return item;
    }
    randomNum -= item.chance;
  }
  return items[items.length - 1]; // Fallback
};