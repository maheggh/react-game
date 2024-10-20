const User = require('../models/User');

// Fetch all player data for the leaderboard with sorting and filtering options
exports.getPlayers = async (req, res) => {
  try {
    const { sortBy = 'money', order = 'desc' } = req.query;

    // Fetch players from the database with necessary fields
    const players = await User.find({}, 'username crimesPerformed rank money isAlive inventory').lean();

    // Format players by counting boss items, safely handling undefined or empty inventory
    const formattedPlayers = players.map(player => ({
      ...player,
      bossItems: player.inventory ? player.inventory.filter(item => item.name.includes('Boss')).length : 0,
    }));

    // Sorting logic
    const sortedPlayers = formattedPlayers.sort((a, b) => {
      if (sortBy === 'money') {
        return order === 'asc' ? a.money - b.money : b.money - a.money;
      } else if (sortBy === 'rank') {
        return order === 'asc' ? a.rank.localeCompare(b.rank) : b.rank.localeCompare(a.rank);
      } else if (sortBy === 'crimesPerformed') {
        return order === 'asc' ? a.crimesPerformed - b.crimesPerformed : b.crimesPerformed - a.crimesPerformed;
      } else if (sortBy === 'bossItems') {
        return order === 'asc' ? a.bossItems - b.bossItems : b.bossItems - a.bossItems;
      }
      return 0;
    });

    res.status(200).json({ success: true, players: sortedPlayers });
  } catch (error) {
    console.error('Error fetching player data:', error);
    res.status(500).json({ success: false, message: 'Error fetching player data' });
  }
};


// Fetch a specific player's profile by ID
exports.getPlayerById = async (req, res) => {
  try {
    const playerId = req.params.id;
    const player = await User.findById(playerId).lean();

    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    // Safely count boss items in the player's inventory
    const bossItemsCount = player.inventory ? player.inventory.filter(item => item.name.toLowerCase().includes('boss')).length : 0;

    res.status(200).json({
      success: true,
      player: {
        ...player,
        bossItems: bossItemsCount,
      },
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ success: false, message: 'Error fetching player data' });
  }
};
