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
  'PotatoQueen': 450000, 
};

const getRankForXp = (xp) => {
  let currentRank = 'Homeless Potato';  
  let nextRank = null;  
  let nextRankThreshold = null;  
  let currentRankThreshold = 0;  

  const ranks = Object.keys(xpThresholds);  

  for (let i = 0; i < ranks.length; i++) {
    const rank = ranks[i];
    const threshold = xpThresholds[rank];

    if (xp >= threshold) {
      currentRank = rank;
      currentRankThreshold = threshold;  
    } else {
      nextRank = rank;
      nextRankThreshold = threshold;  
      break;  
    }
  }

  if (!nextRank) {
    nextRank = 'Max Rank Achieved';  
    nextRankThreshold = currentRankThreshold;  
  }

  const xpForNextLevel = nextRankThreshold - xp;  

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
