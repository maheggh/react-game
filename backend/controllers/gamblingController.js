const User = require('../models/User');

const wheelSections = [
  { prize: 'Lose', amount: 0, probability: 0.4 },
  { prize: 'Win $50', amount: 50, probability: 0.2 },
  { prize: 'Win $100', amount: 100, probability: 0.15 },
  { prize: 'Win $200', amount: 200, probability: 0.1 },
  { prize: 'Jackpot! $500', amount: 500, probability: 0.05 },
  { prize: 'Win $300', amount: 300, probability: 0.1 },
];

exports.spinWheel = async (req, res) => {
  try {
    const userId = req.user.userId; // Extract user ID from authenticated token
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const entryFee = 100;

    if (user.balance < entryFee) {
      return res.status(400).json({ message: 'Insufficient balance to spin the wheel.' });
    }

    // Deduct the entry fee
    user.balance -= entryFee;

    // Determine the spin result based on random chance
    const randomSpin = Math.random();
    let cumulativeProbability = 0;
    const result = wheelSections.find(section => {
      cumulativeProbability += section.probability;
      return randomSpin <= cumulativeProbability;
    });

    // Update user balance with the prize
    user.balance += result.amount;
    await user.save();

    res.status(200).json({
      message: `You won ${result.prize}!`,
      newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing spin', error });
  }
};