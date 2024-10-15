// models/Item.js

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // 'weapon', 'armor', 'loot', etc.
  price: { type: Number, required: true },
  image: { type: String },
  attributes: { type: mongoose.Schema.Types.Mixed }, // Additional attributes per item type
});

module.exports = mongoose.model('Item', itemSchema);
