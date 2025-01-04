// routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Weapons
router.post('/weapons/buy', authMiddleware, inventoryController.buyItem('weapon'));
router.post('/weapons/sell', authMiddleware, inventoryController.sellItem('weapon'));

// Armor
router.post('/armor/buy', authMiddleware, inventoryController.buyItem('armor'));
router.post('/armor/sell', authMiddleware, inventoryController.sellItem('armor'));

// Loot
router.post('/loot/collect', authMiddleware, inventoryController.collectLoot);

// General Inventory Routes
router.get('/', authMiddleware, inventoryController.getInventory);
router.post('/update', authMiddleware, inventoryController.updateInventory);

module.exports = router;
