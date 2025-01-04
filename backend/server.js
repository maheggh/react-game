const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');

dotenv.config();

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
const bossRoutes = require('./routes/bossRoutes');

const app = express();

app.use(cors());
app.use(express.json());

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many accounts created.' },
});
app.use('/api/users/register', registrationLimiter);

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
app.use('/api/bosses', bossRoutes);

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
