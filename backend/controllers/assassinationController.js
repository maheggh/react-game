// controllers/assassinationController.js

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

    // Find the weapon in the attacker's inventory
    const weapon = attacker.inventory.find(
      (item) => item.name === weaponName && item.attributes?.accuracy
    );

    if (!weapon) {
      return res.status(400).json({ success: false, message: 'Weapon not found in inventory.' });
    }

    // Find the boss item in the attacker's possession
    const bossItem = bossItemName
      ? attacker.bossItems.find((item) => item.name === bossItemName)
      : null;

    // Adjust bullet cost if Invisible Cloak is used
    if (bossItem && bossItem.name === 'Invisible Cloak') {
      totalBulletCost = 0;
    }

    if (attacker.money < totalBulletCost) {
      return res.status(400).json({ success: false, message: 'Not enough money for bullets.' });
    }

    attacker.money -= totalBulletCost;

    const attackerRankInfo = getRankForXp(attacker.xp);
    const targetRankInfo = getRankForXp(target.xp);

    // Corrected function call with proper arguments
    let successChance = calculateSuccessChance(
      weapon,
      bossItem,
      bulletsUsed,
      attackerRankInfo,
      targetRankInfo
    );

    // Log the calculated success chance
    console.log('Calculated success chance:', successChance);

    // Cap the success chance at 95%
    successChance = Math.min(successChance, 0.95);

    if (Math.random() < successChance) {
      const lootMultiplier = calculateLootMultiplier(bossItem);

      attacker.kills += 1;

      const lootMoney = (target.money || 0) * lootMultiplier;
      attacker.money += lootMoney;
      target.money -= lootMoney;

      const xpGained = calculateXpReward(bossItem);
      attacker.xp += xpGained;
      attacker.rank = getRankForXp(attacker.xp).currentRank;

      // Mark the target as dead
      target.isAlive = false;

      if (bossItem) {
        // Remove the used boss item from the attacker's inventory
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
      const retaliationChance = calculateRetaliationChance(bossItem);

      // Log the calculated retaliation chance
      console.log('Calculated retaliation chance:', retaliationChance);

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
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Helper Functions

const calculateSuccessChance = (
  weapon,
  bossItem,
  bulletsUsed,
  attackerRankInfo,
  targetRankInfo
) => {
  // Validate weapon and accuracy
  if (
    !weapon ||
    !weapon.attributes ||
    isNaN(parseFloat(weapon.attributes.accuracy))
  ) {
    console.error('Invalid weapon data:', weapon);
    throw new Error('Weapon data is invalid or missing accuracy attribute.');
  }

  // Parse accuracy to a float
  let weaponAccuracy = parseFloat(weapon.attributes.accuracy);
  if (isNaN(weaponAccuracy)) {
    console.error('Weapon accuracy is not a valid number:', weapon.attributes.accuracy);
    throw new Error('Weapon accuracy is invalid.');
  }

  // Log weapon attributes and accuracy
  console.log('Weapon attributes:', weapon.attributes);
  console.log('Parsed weapon accuracy:', weaponAccuracy);

  // Convert accuracy percentage to decimal
  let baseSuccessChance = weaponAccuracy / 100;
  console.log('Base success chance after accuracy conversion:', baseSuccessChance);

  // Calculate bullet effect
  let bulletEffect = Math.log2(bulletsUsed + 1);
  console.log('Bullet effect (log2 of bullets used + 1):', bulletEffect);

  baseSuccessChance *= bulletEffect;
  console.log('Base success chance after bullet effect:', baseSuccessChance);

  // Calculate rank effect
  const rankDifference = attackerRankInfo.rankLevel - targetRankInfo.rankLevel;
  console.log('Rank difference:', rankDifference);

  const rankEffect = 0.05 * rankDifference;
  console.log('Rank effect (0.05 * rank difference):', rankEffect);

  baseSuccessChance += rankEffect;
  console.log('Base success chance after rank effect:', baseSuccessChance);

  // Apply boss item effects
  if (bossItem) {
    console.log('Boss item used:', bossItem.name);
    switch (bossItem.name) {
      case 'Presidential Medal':
        baseSuccessChance += 0.4;
        console.log('Base success chance after Presidential Medal effect:', baseSuccessChance);
        break;
      case 'Mafia Ring':
        baseSuccessChance *= 4;
        console.log('Base success chance after Mafia Ring effect:', baseSuccessChance);
        break;
      case "Sheriff's Badge":
        baseSuccessChance += 0.1;
        console.log('Base success chance after Sheriff\'s Badge effect:', baseSuccessChance);
        break;
      // Add other boss items as needed
    }
  }

  // Cap and floor the success chance
  const successChance = Math.min(Math.max(baseSuccessChance, 0), 0.95);
  console.log('Final success chance (capped between 0 and 0.95):', successChance);

  return successChance;
};

const calculateRetaliationChance = (bossItem) => {
  let retaliationChance = 0.02;

  if (bossItem) {
    switch (bossItem.name) {
      case 'Mafia Ring':
        retaliationChance *= 10;
        console.log('Retaliation chance increased due to Mafia Ring:', retaliationChance);
        break;
      case 'Invisible Cloak':
        retaliationChance = 0;
        console.log('Retaliation chance set to 0 due to Invisible Cloak');
        break;
      case "Sheriff's Badge":
        retaliationChance *= 0.5; // Reduce retaliation chance by 50%
        console.log('Retaliation chance reduced due to Sheriff\'s Badge:', retaliationChance);
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

const calculateXpReward = (bossItem) => {
  let baseXp = 100;

  if (bossItem) {
    switch (bossItem.name) {
      case 'Presidential Medal':
        baseXp += baseXp * 0.3; // Increase XP by 30%
        break;
      case 'Golden Spatula':
        baseXp += baseXp * 2; // Double the XP
        break;
      case 'Star Dust':
        baseXp += 3000; // Add 3000 XP
        break;
    }
  }

  return baseXp;
};
