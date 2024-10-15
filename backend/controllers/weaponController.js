// controllers/weaponController.js

const weapons = require('../data/weaponsData');
const User = require('../models/User');

exports.getWeapons = (req, res) => {
  res.status(200).json({ success: true, items: weapons });
};

exports.buyWeapon = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { weaponId } = req.body;

    const weapon = weapons.find((w) => w.id === weaponId);
    if (!weapon) {
      return res.status(404).json({ success: false, message: 'Weapon not found' });
    }

    const user = await User.findById(userId);

    if (user.money < weapon.price) {
      return res.status(400).json({ success: false, message: 'Not enough money' });
    }

    // Deduct money and add weapon to inventory
    user.money -= weapon.price;

    const inventoryItem = user.inventory.find((item) => item.name === weapon.name);

    if (inventoryItem) {
      // Increase quantity if the weapon is already in inventory
      inventoryItem.quantity += 1;
    } else {
      // Add new weapon to inventory
      user.inventory.push({
        name: weapon.name,
        quantity: 1,
        price: weapon.price,
        attributes: { accuracy: weapon.accuracy },
        image: weapon.image,
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `${weapon.name} purchased successfully`,
      money: user.money,
      inventory: user.inventory,
    });
  } catch (error) {
    console.error('Error buying weapon:', error);
    res.status(500).json({ success: false, message: 'Server error buying weapon' });
  }
};

exports.sellWeapon = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { weaponName } = req.body;

    const user = await User.findById(userId);

    const inventoryItemIndex = user.inventory.findIndex(
      (item) => item.name === weaponName
    );

    if (inventoryItemIndex === -1) {
      return res.status(400).json({ success: false, message: 'Weapon not found in inventory' });
    }

    const inventoryItem = user.inventory[inventoryItemIndex];
    const sellPrice = inventoryItem.price * 0.5; // Sell for 50% of the price

    // Increase user's money and update inventory
    user.money += sellPrice;
    inventoryItem.quantity -= 1;

    if (inventoryItem.quantity <= 0) {
      user.inventory.splice(inventoryItemIndex, 1);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `${weaponName} sold for $${sellPrice}`,
      money: user.money,
      inventory: user.inventory,
    });
  } catch (error) {
    console.error('Error selling weapon:', error);
    res.status(500).json({ success: false, message: 'Server error selling weapon' });
  }
};
