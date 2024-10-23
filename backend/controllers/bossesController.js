const User = require('../models/User');
const { getRankForXp, xpThresholds } = require('../utils/rankCalculator');

exports.attemptAssassination = async (req, res) => {
  try {
    const attackerId = req.user.userId;
    const { targetId, weaponName, bossItemName, bulletsUsed, lootPercentage } = req.body;

    const bulletCostPerShot = 100; // Cost per bullet
    const totalBulletCost = bulletCostPerShot * bulletsUsed;

    const attacker = await User.findById(attackerId);
    const target = await User.findById(targetId);

    if (!attacker || !target) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (attackerId === targetId) {
      return res.status(400).json({ success: false, message: 'You cannot attack yourself.' });
    }

    if (!attacker.isAlive) {
      return res.status(400).json({ success: false, message: 'You are dead and cannot attack.' });
    }

    if (!target.isAlive) {
      return res.status(400).json({ success: false, message: 'Target is already dead.' });
    }

    const weapon = attacker.inventory.find((item) => item.name === weaponName);
    if (!weapon || !weapon.attributes.accuracy) {
      return res.status(400).json({ success: false, message: 'Weapon not found in inventory.' });
    }

    const bossItem = attacker.bossItems.find((item) => item.name === bossItemName);

    // Calculate the success chance
    let successChance = calculateSuccessChance(attacker, target, weapon, bossItem, bulletsUsed);

    // Apply bullet cost reduction if boss item reduces cost
    let actualBulletCost = totalBulletCost;
    if (bossItem && bossItem.name === 'Golden Spatula') {
      actualBulletCost = 0; // Free bullets with the Golden Spatula
    }

    // Ensure the attacker has enough money for bullets
    if (attacker.money < actualBulletCost) {
      return res.status(400).json({ success: false, message: 'Not enough money to buy bullets.' });
    }

    // Deduct the bullet cost
    attacker.money -= actualBulletCost;

    if (Math.random() < successChance) {
      const lootMultiplier = bossItem && bossItem.name === "Dragon's Hoard" ? lootPercentage / 100 : 1;

      // Successful assassination
      attacker.kills += 1;
      await transferAssets(attacker, target, lootMultiplier);

      const xpGained = calculateXpReward(attacker, bossItem, target);
      attacker.xp += xpGained;
      attacker.rank = getRankForXp(attacker.xp).currentRank;

      if (bossItem) {
        attacker.bossItems = attacker.bossItems.filter((item) => item.name !== bossItemName);
      }

      await attacker.save();
      await target.save();

      res.status(200).json({
        success: true,
        message: `You successfully assassinated ${target.username}!`,
        lootMoney: target.money * lootMultiplier,
        lootCars: target.cars,
        lootInventory: target.inventory,
        updatedKills: attacker.kills,
        xpGained,
        actualBulletCost,
      });
    } else {
      const retaliationChance = calculateRetaliationChance(attacker, target, bossItem);

      if (Math.random() < retaliationChance && (!bossItem || bossItem.name !== 'Invisible Cloak')) {
        attacker.isAlive = false;
        await attacker.save();

        res.status(200).json({
          success: false,
          message: `Assassination failed and you were killed by ${target.username}!`,
          userDied: true,
        });
      } else {
        res.status(200).json({
          success: false,
          message: `Assassination attempt on ${target.username} failed.`,
        });
      }
    }
  } catch (error) {
    console.error('Error during assassination:', error);
    res.status(500).json({ success: false, message: 'Server error during assassination.' });
  }
};

const calculateSuccessChance = (attacker, target, weapon, bossItem, bulletsUsed) => {
  let successChance = weapon.attributes.accuracy / 100 * bulletsUsed;

  if (bossItem) {
    switch (bossItem.name) {
      case 'Mafia Ring':
        successChance += 0.2;
        break;
      case "Dragon's Hoard":
        successChance += 0.5;
        break;
      case 'Golden Spatula':
        successChance *= 2;
        break;
      case 'Star Dust':
        successChance += 0.5;
        break;
      case 'Presidential Medal':
        successChance += 0.1;
        break;
    }
  }

  return Math.min(successChance, 0.95);
};

const calculateXpReward = (attacker, bossItem, target) => {
  let baseXp = target.level * 100;

  if (bossItem) {
    switch (bossItem.name) {
      case 'Presidential Medal':
        baseXp *= 2;
        break;
      case 'Pirate\'s Compass':
        baseXp += 500;
        break;
      case 'Star Dust':
        baseXp += 0.25 * baseXp;
        break;
    }
  }

  return baseXp;
};

const calculateRetaliationChance = (attacker, target, bossItem) => {
  let retaliationChance = 0.3;

  if (bossItem) {
    switch (bossItem.name) {
      case 'Mafia Ring':
        retaliationChance -= 0.15;
        break;
      case 'Sheriff\'s Badge':
        retaliationChance = 0;
        break;
    }
  }

  return Math.max(retaliationChance, 0.05);
};

const transferAssets = async (attacker, target, lootMultiplier) => {
  attacker.money += target.money * lootMultiplier;
  target.money = 0;

  attacker.cars.push(...target.cars);
  target.cars = [];

  attacker.inventory.push(...target.inventory);
  target.inventory = [];
};
