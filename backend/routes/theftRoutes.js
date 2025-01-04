const express = require('express');
const router = express.Router();
const theftController = require('../controllers/theftController');
const authMiddleware = require('../middleware/authMiddleware');

// Theft routes

router.post('/steal', authMiddleware, theftController.stealItem);
router.post('/sell', authMiddleware, theftController.sellItem);

module.exports = router;