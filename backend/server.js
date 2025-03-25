/****************************************************
 * server.js
 ****************************************************/
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// Import route files
const userRoutes = require('./routes/userRoutes');
const carRoutes = require('./routes/carRoutes');
const carRacesRoutes = require('./routes/carRacesRoutes');
const carTheftRoutes = require('./routes/carTheftRoutes');
const theftRoutes = require('./routes/theftRoutes');
const itemRoutes = require('./routes/itemRoutes');
const weaponRoutes = require('./routes/weaponRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const assassinationRoutes = require('./routes/assassinationRoutes');
const gamblingRoutes = require('./routes/gamblingRoutes');
const playerRoutes = require('./routes/playerRoutes');
const jailRoutes = require('./routes/jailRoutes');

// Initialize app
const app = express();

// Configure CORS (example: allow requests from localhost:3000)
app.use(cors({
  origin: 'http://localhost:3000', // adjust as needed if frontend is on a different domain
  credentials: true,              // allow cookies
}));

// Parse JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Rate limit for registration
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many accounts created.' },
});
app.use('/api/users/register', registrationLimiter);

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/carraces', carRacesRoutes);
app.use('/api/cartheft', carTheftRoutes);
app.use('/api/theft', theftRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/weapons', weaponRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/assassination', assassinationRoutes);
app.use('/api/spin', gamblingRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/jail', jailRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Serve frontend from "dist" folder
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Simple error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
