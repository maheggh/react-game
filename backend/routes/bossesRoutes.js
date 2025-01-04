const express = require('express');
const router = express.Router();
const bossController = require('../controllers/bossController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/fight', authMiddleware, bossController.fightBoss);
router.post('/updateBossItems', authMiddleware, bossController.updateBossItems);
router.post('/updateMoney', authMiddleware, bossController.updateMoney);
router.post('/updateXP', authMiddleware, bossController.updateXP);

module.exports = router;
