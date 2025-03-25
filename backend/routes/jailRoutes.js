
const express = require('express');
const router = express.Router();
const jailController = require('../controllers/jailController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/time', authMiddleware, jailController.getJailTime);

module.exports = router;
