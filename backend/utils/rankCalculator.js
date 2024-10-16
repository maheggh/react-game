// utils/rankCalculator.js

// XP thresholds for each rank
const xpThresholds = {
  'Homeless Potato': 0,
  'Potato Peeler': 1000,
  'Mashed Potato': 2500,
  'Baked Spud': 5000,
  'Fry Cook': 10000,
  'Hash Brown Hero': 16000,
  'Potato Mobster': 25000,
  'Tater Tot Titan': 40000,
  'Spudlord': 60000,
  'Mashmaster General': 85000,
  'Duke of Dauphinoise': 120000,
  'Fry King': 160000,
  'Emperor of the Taters': 210000,
  'Potato Overlord': 270000,
  'The Ultimate Potato': 350000,
  'Queen of All Spuds': 450000,  // Final Rank
};

// Function to get rank based on XP and progress towards the next rank
const getRankForXp = (xp) => {
  let currentRank = 'Homeless Potato';  // Default rank
  let nextRank = null;  // The next rank to aim for
  let nextRankThreshold = null;  // XP needed for the next rank
  let currentRankThreshold = 0;  // Current rank's XP threshold

  const ranks = Object.keys(xpThresholds);  // Get all ranks in order

  for (let i = 0; i < ranks.length; i++) {
    const rank = ranks[i];
    const threshold = xpThresholds[rank];

    if (xp >= threshold) {
      currentRank = rank;
      currentRankThreshold = threshold;  // Update current rank threshold
    } else {
      nextRank = rank;
      nextRankThreshold = threshold;  // Set the next rank and its XP threshold
      break;  // Stop as soon as we find the next rank
    }
  }

  if (!nextRank) {
    nextRank = 'Max Rank Achieved';  // No further rank if at the top
    nextRankThreshold = currentRankThreshold;  // Cap at current rank's threshold
  }

  const xpForNextLevel = nextRankThreshold - xp;  // XP needed for the next rank

  return {
    currentRank,
    nextRank,
    currentXp: xp,
    nextRankThreshold,
    xpForNextLevel,
    currentRankThreshold,
  };
};

module.exports = { getRankForXp, xpThresholds };
