// routes/weaponRoutes.js

const express = require('express');
const router = express.Router();
const weaponController = require('../controllers/weaponController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', weaponController.getWeapons);
router.post('/buy', authMiddleware, weaponController.buyWeapon);
router.post('/sell', authMiddleware, weaponController.sellWeapon);

module.exports = router;