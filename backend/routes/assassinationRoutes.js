// routes/assassinationRoutes.js

const express = require('express');
const router = express.Router();
const assassinationController = require('../controllers/assassinationController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to attempt an assassination
router.post('/', authMiddleware, assassinationController.attemptAssassination);

module.exports = router;
