const User = require('../models/User');

const wheelSections = [
  { prize: 'Lose', amount: 0, probability: 0.4 },
  { prize: 'Win $50', amount: 50, probability: 0.2 },
  { prize: 'Win $100', amount: 100, probability: 0.15 },
  { prize: 'Win $200', amount: 200, probability: 0.1 },
  { prize: 'Jackpot! $500', amount: 500, probability: 0.05 },
  { prize: 'Win $300', amount: 300, probability: 0.1 }
];

exports.spinWheel = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const cost = 250;
    if (user.money < cost) {
      return res.status(400).json({ message: 'Not enough money to spin.' });
    }

    user.money -= cost;
    const rand = Math.random();
    let cumulative = 0;
    let result = wheelSections[0];
    for (let section of wheelSections) {
      cumulative += section.probability;
      if (rand <= cumulative) {
        result = section;
        break;
      }
    }
    user.money += result.amount;
    await user.save();
    return res.status(200).json({
      message: `You spun: ${result.prize}`,
      newBalance: user.money
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error spinning wheel' });
  }
};
