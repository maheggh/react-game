// controllers/inventoryController.js

const User = require('../models/User');
const Item = require('../models/Item');

exports.buyItem = (itemType) => async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.body;

    const item = await Item.findOne({ _id: itemId, type: itemType });
    if (!item) {
      return res.status(404).json({ success: false, message: `${itemType} not found` });
    }

    const user = await User.findById(userId);

    if (user.money < item.price) {
      return res.status(400).json({ success: false, message: 'Not enough money' });
    }

    // Deduct money and add item to inventory
    user.money -= item.price;

    const inventoryItem = user.inventory.find(
      (invItem) => invItem.item.toString() === item._id.toString()
    );

    if (inventoryItem) {
      // If item already exists in inventory, increase quantity
      inventoryItem.quantity += 1;
    } else {
      // Add new item to inventory
      user.inventory.push({ item: item._id, quantity: 1 });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `${item.name} purchased successfully`,
      money: user.money,
      inventory: user.inventory,
    });
  } catch (error) {
    console.error(`Error buying ${itemType}:`, error);
    res.status(500).json({ success: false, message: `Server error buying ${itemType}` });
  }
};

exports.sellItem = (itemType) => async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.body;

    const item = await Item.findOne({ _id: itemId, type: itemType });
    if (!item) {
      return res.status(404).json({ success: false, message: `${itemType} not found` });
    }

    const user = await User.findById(userId);

    const inventoryItemIndex = user.inventory.findIndex(
      (invItem) => invItem.item.toString() === item._id.toString()
    );

    if (inventoryItemIndex === -1) {
      return res.status(400).json({ success: false, message: `${itemType} not found in inventory` });
    }

    const inventoryItem = user.inventory[inventoryItemIndex];
    const sellPrice = item.price * 0.5; // 50% of the price

    // Add money and decrease quantity
    user.money += sellPrice;
    inventoryItem.quantity -= 1;

    if (inventoryItem.quantity <= 0) {
      user.inventory.splice(inventoryItemIndex, 1);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `${item.name} sold for $${sellPrice}`,
      money: user.money,
      inventory: user.inventory,
    });
  } catch (error) {
    console.error(`Error selling ${itemType}:`, error);
    res.status(500).json({ success: false, message: `Server error selling ${itemType}` });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).populate('inventory.item');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      inventory: user.inventory,
      money: user.money,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, message: 'Server error fetching inventory' });
  }
};
exports.updateInventory = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { inventory } = req.body;
  
      const user = await User.findById(userId);
  
      if (!Array.isArray(inventory)) {
        return res.status(400).json({ success: false, message: 'Inventory must be an array.' });
      }
  
      user.inventory = inventory;
      await user.save();
  
      res.status(200).json({ success: true, inventory: user.inventory });
    } catch (error) {
      console.error('Error updating inventory:', error);
      res.status(500).json({ success: false, message: 'Server error updating inventory' });
    }
  };

  exports.collectLoot = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { lootItem } = req.body; // Assuming you send lootItem in the request body
  
      const user = await User.findById(userId);
  
      // Add the loot item to the user's inventory
      const existingItem = user.inventory.find((invItem) => invItem.name === lootItem.name);
  
      if (existingItem) {
        existingItem.quantity += lootItem.quantity || 1;
      } else {
        user.inventory.push({
          name: lootItem.name,
          quantity: lootItem.quantity || 1,
          price: lootItem.price || 0,
          attributes: lootItem.attributes || {},
          image: lootItem.image || '',
        });
      }
  
      await user.save();
  
      res.status(200).json({ success: true, inventory: user.inventory });
    } catch (error) {
      console.error('Error collecting loot:', error);
      res.status(500).json({ success: false, message: 'Server error collecting loot' });
    }
  };