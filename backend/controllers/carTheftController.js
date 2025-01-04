const User = require('../models/User');
const { getRankForXp } = require('../utils/rankCalculator');

const venuesData = [
  {
    venueName: 'Rich Potato Neighborhood',
    image: '/assets/rich.png',
    baseStealChance: 5,
    cars: [
      { name: 'Luxury Spud Sedan', price: 120000, baseChance: 5, image: '/assets/luxury-spud-sedan.png' },
      { name: 'Sporty Tater Coupe', price: 40000, baseChance: 8, image: '/assets/sporty-tater-coupe.png' },
      { name: 'Potato Convertible', price: 30000, baseChance: 10, image: '/assets/potato-convertible.png' },
      { name: 'SUV Spud', price: 2000, baseChance: 20, image: '/assets/suv-spud.png' }
    ]
  },
  {
    venueName: 'Spudville Downtown',
    image: '/assets/downtown.png',
    baseStealChance: 10,
    cars: [
      { name: 'Hatchback Tuber', price: 1500, baseChance: 20, image: '/assets/hatchback-tuber.png' },
      { name: 'Sedan Yam', price: 20000, baseChance: 10, image: '/assets/sedan-yam.png' },
      { name: 'SUV Tater', price: 25000, baseChance: 8, image: '/assets/suv-tater.png' },
      { name: 'Spudnik Sports', price: 90000, baseChance: 4, image: '/assets/spudnik-sports.png' }
    ]
  },
  {
    venueName: 'Fries End Suburbs',
    image: '/assets/fries.png',
    baseStealChance: 15,
    cars: [
      { name: 'Compact Fry', price: 10000, baseChance: 25, image: '/assets/compact-fry.png' },
      { name: 'Curly Coupe', price: 15000, baseChance: 20, image: '/assets/curly-coupe.png' },
      { name: 'Wedge Wagon', price: 20000, baseChance: 15, image: '/assets/wedge-wagon.png' },
      { name: 'Crispy Convertible', price: 110000, baseChance: 5, image: '/assets/crispy-convertible.png' }
    ]
  },
  {
    venueName: 'Mashy Meadows',
    image: '/assets/mashy.png',
    baseStealChance: 20,
    cars: [
      { name: 'Mashed Mini', price: 500, baseChance: 30, image: '/assets/mashed-mini.png' },
      { name: 'Buttery Buggy', price: 8000, baseChance: 20, image: '/assets/buttery-buggy.png' },
      { name: 'Gravy Sedan', price: 12000, baseChance: 15, image: '/assets/gravy-sedan.png' },
      { name: 'Peeler Pickup', price: 18000, baseChance: 5, image: '/assets/peeler-pickup.png' }
    ]
  },
  {
    venueName: 'Tuber Town',
    image: '/assets/tuber.png',
    baseStealChance: 25,
    cars: [
      { name: 'Root Roadster', price: 7000, baseChance: 30, image: '/assets/root-roadster.png' },
      { name: 'Bulb Buggy', price: 10000, baseChance: 25, image: '/assets/bulb-buggy.png' },
      { name: 'Starch Sedan', price: 15000, baseChance: 15, image: '/assets/starch-sedan.png' },
      { name: 'Tuber Truck', price: 60000, baseChance: 5, image: '/assets/tuber-truck.png' }
    ]
  }
];

function pickRandomCar(cars) {
  let total = cars.reduce((acc, c) => acc + c.baseChance, 0);
  let r = Math.random() * total;
  for (let c of cars) {
    if (r < c.baseChance) return c;
    r -= c.baseChance;
  }
  return cars[cars.length - 1];
}

exports.getVenues = (req, res) => {
  const minimalVenues = venuesData.map((v) => ({
    venueName: v.venueName,
    image: v.image
  }));
  res.json({ venues: minimalVenues });
};

exports.stealCar = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.inJail && user.jailTimeEnd && user.jailTimeEnd > Date.now()) {
      return res.status(403).json({ message: 'You are in jail!', inJail: true, jailTime: 0 });
    }
    if (user.inJail && user.jailTimeEnd <= Date.now()) {
      user.inJail = false;
      user.jailTimeEnd = null;
      await user.save();
    }

    const { venueName } = req.body;
    const venue = venuesData.find((v) => v.venueName === venueName);
    if (!venue) {
      return res.status(400).json({ message: 'Invalid venue' });
    }

    const userLevel = user.level || 1;
    const successChance = Math.min(venue.baseStealChance + userLevel * 2, 90);
    const roll = Math.random() * 100;

    if (roll <= successChance) {
      const stolenCar = pickRandomCar(venue.cars);
      user.cars.push(stolenCar);
      user.xp += 200;
      const rankInfo = getRankForXp(user.xp);
      user.rank = rankInfo.currentRank;
      await user.save();
      return res.status(200).json({
        message: `You stole a ${stolenCar.name}!`,
        car: stolenCar,
        xp: user.xp,
        rank: user.rank
      });
    } else {
      user.inJail = true;
      const jailSeconds = 30;
      user.jailTimeEnd = Date.now() + jailSeconds * 1000;
      await user.save();
      return res.status(403).json({
        message: 'Caught and sent to jail!',
        inJail: true,
        jailTime: jailSeconds
      });
    }
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.sellCar = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { carIndex } = req.body;
    if (carIndex < 0 || carIndex >= user.cars.length) {
      return res.status(400).json({ message: 'Invalid car index' });
    }

    const car = user.cars[carIndex];
    user.money += car.price;
    user.cars.splice(carIndex, 1);
    await user.save();
    return res.status(200).json({
      message: `You sold ${car.name} for $${car.price}`,
      money: user.money
    });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};
