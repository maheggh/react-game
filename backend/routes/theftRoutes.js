const express = require('express');
const router = express.Router();
const theftController = require('../controllers/theftController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/stolen-items', authMiddleware, theftController.getStolenItems);
router.post('/steal', authMiddleware, theftController.stealItem);
router.post('/sell', authMiddleware, theftController.sellItem);

module.exports = router;
