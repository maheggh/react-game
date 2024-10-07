const express = require('express');
const router = express.Router();
const theftController = require('../controllers/theftController');
const authMiddleware = require('../middleware/authMiddleware');

// Steal an item
router.post('/steal-item', authMiddleware, theftController.stealItem);

// Sell a stolen item
router.post('/sell-item', authMiddleware, theftController.sellItem);

module.exports = router;
