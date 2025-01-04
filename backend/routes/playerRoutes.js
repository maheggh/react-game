// routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// Route to fetch all players (for leaderboard)
router.get('/', playerController.getPlayers);

// Route to fetch a specific player by ID
router.get('/:id', playerController.getPlayerById);

module.exports = router;
