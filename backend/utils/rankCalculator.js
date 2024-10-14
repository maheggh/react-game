// utils/rankCalculator.js

// XP thresholds for each rank
const xpThresholds = {
  'Homeless Potato': 0,
  'Beginner': 1000,
  'Amateur': 2000,
  'Street Potato': 4000,
  'Gangster Potato': 8000,
  'Mob Spud': 16000,
  // Add further ranks as necessary...
};

// Function to get rank based on XP
const getRankForXp = (xp) => {
  let currentRank = 'Homeless Potato';  // Default rank

  for (const [rank, threshold] of Object.entries(xpThresholds)) {
    if (xp >= threshold) {
      currentRank = rank;
    } else {
      break;  // Stop when XP is below the threshold for the next rank
    }
  }

  return currentRank;
};

module.exports = { getRankForXp };
