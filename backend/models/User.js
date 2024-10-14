// models/User.js
const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

const stolenItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
});

const inventorySchema = new mongoose.Schema({
  name: String,
  accuracy: Number,  
  price: Number,
});

const bossItemSchema = new mongoose.Schema({
  name: String,
  image: String,
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 }, 
  rank: { type: String, default: 'Homeless Potato' },  
  money: { type: Number, default: 0 },
  cars: [carSchema],
  crimesPerformed: { type: Number, default: 0 },
  assassinationSuccessRate: { type: Number, default: 5 },
  carTheftSuccessRate: { type: Number, default: 10 },
  inventory: [inventorySchema], 
  bossItems: [bossItemSchema],  
  missionsCompleted: { type: Number, default: 0 },
  stolenItems: [stolenItemSchema],  
});

module.exports = mongoose.model("User", userSchema);
