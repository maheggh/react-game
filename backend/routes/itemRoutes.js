// routes/itemRoutes.js

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

router.get('/:itemType', itemController.getItemsByType);

module.exports = router;