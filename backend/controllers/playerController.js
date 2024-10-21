// controllers/playerController.js

const User = require('../models/User');

/**
 * Fetches all players for the leaderboard.
 * Allows sorting by 'kills', 'money', 'rank', 'username', and 'bossItems'.
 */
exports.getPlayers = async (req, res) => {
  try {
    const { sortBy = 'kills', order = 'desc' } = req.query;

    // Define valid sort fields
    const validSortFields = ['kills', 'money', 'rank', 'username'];
    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({ success: false, message: 'Invalid sort field.' });
    }

    // Define sort order
    const sortOrder = order === 'asc' ? 1 : -1;

    // Fetch players from the database with necessary fields
    // Exclude 'inventory' to reduce payload; however, we need it to count 'bossItems'
    const players = await User.find({}, 'username kills rank money isAlive inventory').lean();

    // Format players by counting boss items
    const formattedPlayers = players.map(player => ({
      ...player,
      bossItems: player.inventory ? player.inventory.filter(item => item.name.toLowerCase().includes('boss')).length : 0,
    }));

    // Sort players based on sortBy and sortOrder
    const sortedPlayers = formattedPlayers.sort((a, b) => {
      if (a[sortBy] > b[sortBy]) return sortOrder;
      if (a[sortBy] < b[sortBy]) return -sortOrder;
      return 0;
    });

    res.status(200).json({ success: true, players: sortedPlayers });
  } catch (error) {
    console.error('Error fetching player data:', error);
    res.status(500).json({ success: false, message: 'Error fetching player data.' });
  }
};

/**
 * Fetches a specific player's profile by ID.
 * Includes 'kills' and 'bossItems'.
 */
exports.getPlayerById = async (req, res) => {
  try {
    const playerId = req.params.id;
    const player = await User.findById(playerId).lean();

    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found.' });
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
    res.status(500).json({ success: false, message: 'Error fetching player data.' });
  }
};
