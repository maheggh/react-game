const express = require('express');
const router = express.Router();
const gamblingController = require('../controllers/gamblingController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, gamblingController.spinWheel);

module.exports = router;
