// controllers/assassinationController.js

const User = require('../models/User');
const { getRankForXp, xpThresholds } = require('../utils/rankCalculator');

exports.attemptAssassination = async (req, res) => {
  try {
    const attackerId = req.user.userId;
    const { targetId, weaponName } = req.body;

    // Fetch attacker and target data
    const attacker = await User.findById(attackerId);
    const target = await User.findById(targetId);

    if (!attacker || !target) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent attacking oneself
    if (attackerId === targetId) {
      return res.status(400).json({ success: false, message: 'You cannot attack yourself.' });
    }

    // Check if attacker is alive
    if (!attacker.isAlive) {
      return res.status(400).json({ success: false, message: 'You are dead and cannot attack.' });
    }

    // Check if target is alive
    if (!target.isAlive) {
      return res.status(400).json({ success: false, message: 'Target is already dead.' });
    }

    // Check if attacker has the weapon
    const weapon = attacker.inventory.find((item) => item.name === weaponName);

    if (!weapon || !weapon.attributes.accuracy) {
      return res.status(400).json({ success: false, message: 'Weapon not found in inventory.' });
    }

    const successChance = calculateSuccessChance(attacker, target, weapon);

    if (Math.random() < successChance) {
      target.isAlive = false;
      await target.save();

      res.status(200).json({
        success: true,
        message: `You have successfully assassinated ${target.username}!`,
      });
    } else {
      // Failed attempt, possible retaliation
      const retaliationChance = calculateRetaliationChance(attacker, target);

      if (Math.random() < retaliationChance) {
        // Attacker is killed
        attacker.isAlive = false;
        await attacker.save();

        res.status(200).json({
          success: true,
          message: `Your assassination attempt failed, and you were killed by ${target.username}!`,
          userDied: true, // Flag indicating the attacker is dead
        });
      } else {
        res.status(200).json({
          success: true,
          message: `Your assassination attempt on ${target.username} failed.`,
        });
      }
    }
  } catch (error) {
    console.error('Error during assassination attempt:', error);
    res.status(500).json({ success: false, message: 'Server error during assassination attempt.' });
  }
};

const calculateSuccessChance = (attacker, target, weapon) => {
  const baseChance = 0.1; 

  const attackerRankData = getRankForXp(attacker.xp);
  const targetRankData = getRankForXp(target.xp);

  const attackerRankValue = getRankValue(attackerRankData.currentRank);
  const targetRankValue = getRankValue(targetRankData.currentRank);

  const attackerLevel = attacker.level || 1;
  const targetLevel = target.level || 1;
  const weaponAccuracy = weapon.attributes.accuracy || 0;

  const rankFactor = 0.02; 
  const levelFactor = 0.01; 
  const weaponFactor = 0.005; 

  const rankDifference = attackerRankValue - targetRankValue;
  const levelDifference = attackerLevel - targetLevel;

  let successChance = baseChance
    + (rankDifference * rankFactor)
    + (levelDifference * levelFactor)
    + (weaponAccuracy * weaponFactor);

  // Adjust success chance
  successChance = Math.max(0.05, Math.min(successChance, 0.9)); // Clamp between 5% and 90%

  return successChance;
};

const getRankValue = (rank) => {
  const ranks = Object.keys(xpThresholds);
  const rankIndex = ranks.indexOf(rank);
  return rankIndex !== -1 ? rankIndex + 1 : 1; // +1 to avoid zero
};

const calculateRetaliationChance = (attacker, target) => {
  const attackerLevel = attacker.level || 1;
  const targetLevel = target.level || 1;
  const levelDifference = targetLevel - attackerLevel;
  const baseRetaliationChance = 0.1;
  const levelFactor = 0.02; 

  let retaliationChance = baseRetaliationChance + (levelDifference * levelFactor);

  retaliationChance = Math.max(0.05, Math.min(retaliationChance, 0.8)); 

  return retaliationChance;
};
