// controllers/itemController.js

const Item = require('../models/Item');

exports.getItemsByType = async (req, res) => {
  try {
    const { itemType } = req.params;
    const items = await Item.find({ type: itemType });
    res.status(200).json({ success: true, items });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ success: false, message: 'Server error fetching items' });
  }
};
