const User = require('../models/User');
const { getRankForXp } = require('../utils/rankCalculator');

exports.attemptAssassination = async (req, res) => {
  try {
    const attackerId = req.user.userId;
    const { targetId, weaponName, bossItemName, bulletsUsed } = req.body;

    const bulletCostPerShot = 100;
    let totalBulletCost = bulletCostPerShot * bulletsUsed;

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

    const weapon = attacker.inventory.find((item) => item.name === weaponName && item.attributes?.accuracy);
    if (!weapon) {
      return res.status(400).json({ success: false, message: 'Weapon not found in inventory.' });
    }

    const bossItem = attacker.bossItems.find((item) => item.name === bossItemName);

    if (bossItem && bossItem.name === 'Invisible Cloak') {
      totalBulletCost = 0;
    }

    if (attacker.money < totalBulletCost) {
      return res.status(400).json({ success: false, message: 'Not enough money for bullets.' });
    }

    attacker.money -= totalBulletCost;

    const attackerRankInfo = getRankForXp(attacker.xp);
    const targetRankInfo = getRankForXp(target.xp);

    let successChance = calculateSuccessChance(attacker, target, weapon, bossItem, bulletsUsed, attackerRankInfo, targetRankInfo);
    successChance = Math.min(successChance, 0.95);

    if (Math.random() < successChance) {
      const lootMultiplier = calculateLootMultiplier(bossItem);

      attacker.kills += 1;

      const lootMoney = (target.money || 0) * lootMultiplier;
      attacker.money += lootMoney;
      target.money -= lootMoney;

      const xpGained = calculateXpReward(attacker, bossItem, target);
      attacker.xp += xpGained;
      attacker.rank = getRankForXp(attacker.xp).currentRank;

      if (bossItem) {
        const index = attacker.bossItems.findIndex((item) => item.name === bossItemName);
        if (index !== -1) {
          attacker.bossItems.splice(index, 1);
          attacker.markModified('bossItems');
        }
      }

      await attacker.save();
      await target.save();

      return res.status(200).json({
        success: true,
        message: `You successfully assassinated ${target.username}!`,
        lootMoney,
        updatedKills: attacker.kills,
        xpGained,
        actualBulletCost: totalBulletCost,
      });
    } else {
      const retaliationChance = calculateRetaliationChance(attacker, target, bossItem);

      if (Math.random() < retaliationChance) {
        attacker.isAlive = false;
        await attacker.save();

        return res.status(200).json({
          success: false,
          message: `Assassination failed and you were killed by ${target.username}!`,
          userDied: true,
        });
      } else {
        return res.status(200).json({
          success: false,
          message: `Assassination attempt on ${target.username} failed.`,
        });
      }
    }
  } catch (error) {
    console.error('Error during assassination:', error);
    return res.status(500).json({ success: false, message: 'Server error during assassination.' });
  }
};

const calculateSuccessChance = (
  attacker,
  target,
  weapon,
  bossItem,
  bulletsUsed,
  attackerRankInfo,
  targetRankInfo
) => {
  let baseSuccessChance = weapon.attributes.accuracy / 100;
  let bulletEffect = Math.log10(bulletsUsed + 1) / 2; 
  baseSuccessChance *= bulletEffect;
  const rankDifference = attackerRankInfo.rankLevel - targetRankInfo.rankLevel;
  const rankEffect = 0.05 * rankDifference;
  baseSuccessChance += rankEffect;

  if (bossItem) {
    switch (bossItem.name) {
      case 'Presidential Medal':
        baseSuccessChance += 0.4;
        break;
      case 'Mafia Ring':
        baseSuccessChance *= 4;
        break;
      case "Sheriff's Badge":
        baseSuccessChance += 0.1;
        break;
    }
  }

  return Math.min(baseSuccessChance, 0.95); 
};


const calculateRetaliationChance = (attacker, target, bossItem) => {
  let retaliationChance = 0.05;

  if (bossItem) {
    switch (bossItem.name) {
      case 'Mafia Ring':
        retaliationChance *= 10;
        break;
      case 'Invisible Cloak':
        retaliationChance = 0;
        break;
      case "Sheriff's Badge":
        retaliationChance -= 0.5 * retaliationChance;
        break;
    }
  }

  return Math.max(retaliationChance, 0);
};

const calculateLootMultiplier = (bossItem) => {
  let lootMultiplier = 0.5;

  if (bossItem) {
    switch (bossItem.name) {
      case 'Presidential Medal':
      case 'Mafia Ring':
      case "Pirate's Compass":
        lootMultiplier = 0.75;
        break;
      case "Dragon's Hoard":
        lootMultiplier = 1;
        break;
    }
  }

  return lootMultiplier;
};

const calculateXpReward = (attacker, bossItem, target) => {
  let baseXp = 100;

  if (bossItem) {
    switch (bossItem.name) {
      case 'Presidential Medal':
        baseXp += baseXp * 0.3;
        break;
      case 'Golden Spatula':
        baseXp += baseXp * 2;
        break;
      case 'Star Dust':
        baseXp += 3000;
        break;
    }
  }

  return baseXp;
};
