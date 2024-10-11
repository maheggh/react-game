// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  level: { type: Number, default: 1 },
  rank: { type: String, default: "Beginner" },
  money: { type: Number, default: 0 },
  cars: [{ name: String, price: Number }],
  crimesPerformed: { type: Number, default: 0 },
  assassinationSuccessRate: { type: Number, default: 5 },
  carTheftSuccessRate: { type: Number, default: 10 },
  inventory: { type: Array, default: [] },
  bossItems: { type: Array, default: [] },
  missionsCompleted: { type: Number, default: 0 },
  stolenItems: [{ name: String, price: Number, image: String }],
});

module.exports = mongoose.model("User", userSchema);
