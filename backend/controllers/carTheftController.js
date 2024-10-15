// controllers/cartheftController.js

const User = require('../models/User');
const { getRankForXp } = require('../utils/rankCalculator');

// Define venues and their associated cars
const venues = {
  'Rich Potato Neighborhood': {
    cars: [
      { name: 'Luxury Spud Sedan', price: 120000, baseChance: 5, image: '/assets/luxury-spud-sedan.png' },
      { name: 'Sporty Tater Coupe', price: 40000, baseChance: 8, image: '/assets/sporty-tater-coupe.png' },
      { name: 'Potato Convertible', price: 30000, baseChance: 10, image: '/assets/potato-convertible.png' },
      { name: 'SUV Spud', price: 2000, baseChance: 20, image: '/assets/suv-spud.png' },
    ],
    baseStealChance: 5,
  },
  'Spudville Downtown': {
    cars: [
      { name: 'Hatchback Tuber', price: 1500, baseChance: 20, image: '/assets/hatchback-tuber.png' },
      { name: 'Sedan Yam', price: 20000, baseChance: 10, image: '/assets/sedan-yam.png' },
      { name: 'SUV Tater', price: 25000, baseChance: 8, image: '/assets/suv-tater.png' },
      { name: 'Spudnik Sports', price: 90000, baseChance: 4, image: '/assets/spudnik-sports.png' },
    ],
    baseStealChance: 10,
  },
  'Fries End Suburbs': {
    cars: [
      { name: 'Compact Fry', price: 10000, baseChance: 25, image: '/assets/compact-fry.png' },
      { name: 'Curly Coupe', price: 15000, baseChance: 20, image: '/assets/curly-coupe.png' },
      { name: 'Wedge Wagon', price: 20000, baseChance: 15, image: '/assets/wedge-wagon.png' },
      { name: 'Crispy Convertible', price: 110000, baseChance: 5, image: '/assets/crispy-convertible.png' },
    ],
    baseStealChance: 15,
  },
  'Mashy Meadows': {
    cars: [
      { name: 'Mashed Mini', price: 500, baseChance: 30, image: '/assets/mashed-mini.png' },
      { name: 'Buttery Buggy', price: 8000, baseChance: 20, image: '/assets/buttery-buggy.png' },
      { name: 'Gravy Sedan', price: 12000, baseChance: 15, image: '/assets/gravy-sedan.png' },
      { name: 'Peeler Pickup', price: 18000, baseChance: 5, image: '/assets/peeler-pickup.png' },
    ],
    baseStealChance: 20,
  },
  'Tuber Town': {
    cars: [
      { name: 'Root Roadster', price: 7000, baseChance: 30, image: '/assets/root-roadster.png' },
      { name: 'Bulb Buggy', price: 10000, baseChance: 25, image: '/assets/bulb-buggy.png' },
      { name: 'Starch Sedan', price: 15000, baseChance: 15, image: '/assets/starch-sedan.png' },
      { name: 'Tuber Truck', price: 60000, baseChance: 5, image: '/assets/tuber-truck.png' },
    ],
    baseStealChance: 25,
  },
};

// Helper function to select a random car based on baseChance
const getRandomCar = (cars) => {
  let totalChance = cars.reduce((sum, car) => sum + car.baseChance, 0);
  let randomNum = Math.random() * totalChance;

  for (let car of cars) {
    if (randomNum < car.baseChance) {
      return car;
    }
    randomNum -= car.baseChance;
  }
  return cars[cars.length - 1];
};

// Steal a car
exports.stealCar = async (req, res) => {
  const { venueName } = req.body;

  try {
    const user = await User.findById(req.user.userId); // Ensure your auth middleware sets req.user.userId

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Release user from jail if jail time has expired
    if (user.inJail && user.jailTimeEnd <= Date.now()) {
      user.inJail = false;
      user.jailTimeEnd = null;
      await user.save();
    }

    if (user.inJail) {
      return res.status(403).json({ message: 'You cannot steal cars while in jail!' });
    }

    const venue = venues[venueName];
    if (!venue) {
      return res.status(400).json({ message: 'Invalid venue' });
    }

    // Calculate steal chance based on user's level or rank
    const stealChance = Math.min(venue.baseStealChance + user.level * 2, 90);
    const stealRoll = Math.random() * 100;

    if (stealRoll <= stealChance) {
      // Successful theft
      const car = getRandomCar(venue.cars);

      // Add the car to the user's cars array
      user.cars.push(car);

      // Increase user's XP and update rank
      const xpGained = 50; // Adjust XP as needed
      user.xp += xpGained;
      const rankInfo = getRankForXp(user.xp);
      user.rank = rankInfo.currentRank;

      await user.save();

      res.status(200).json({
        message: `You successfully stole a ${car.name}!`,
        car: car,
        xp: user.xp,
        rank: user.rank,
      });
    } else {
      // Failed theft - Send to jail
      const jailTime = 30; // Jail time in seconds
      user.inJail = true;
      user.jailTimeEnd = Date.now() + jailTime * 1000; // Set release time
      await user.save();

      res.status(403).json({
        message: 'You got caught and sent to jail!',
        inJail: true,
        jailTime: jailTime,
      });
    }
  } catch (error) {
    console.error('Error during car theft:', error);
    res.status(500).json({ message: 'Failed to steal car', error: error.message });
  }
};

// Sell a car
exports.sellCar = async (req, res) => {
  const { carIndex } = req.body;

  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (carIndex < 0 || carIndex >= user.cars.length) {
      return res.status(400).json({ message: 'Invalid car index' });
    }

    const car = user.cars[carIndex];

    // Add car's price to user's money
    user.money += car.price;

    // Remove the car from user's cars
    user.cars.splice(carIndex, 1);

    await user.save();

    res.status(200).json({
      message: `You sold ${car.name} for $${car.price}`,
      money: user.money,
    });
  } catch (error) {
    console.error('Error selling car:', error);
    res.status(500).json({ message: 'Failed to sell car', error: error.message });
  }
};
