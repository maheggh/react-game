const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  type: String,
});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;