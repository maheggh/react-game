const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
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

const app = express();

// Enable CORS
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Use routes
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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Ensure the server doesn't start if DB connection fails
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const rateLimit = require('express-rate-limit');

// Define rate limiting rules
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 registration requests per windowMs
  message: { success: false, message: 'Too many accounts created from this IP, please try again later.' },
});

// Apply the rate limiter to your registration route
app.use('/api/users/register', registrationLimiter);