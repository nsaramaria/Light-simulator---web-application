const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const sceneRoutes = require('./routes/scenes');

const app = express();

// Allow frontend to talk to backend
app.use(cors({ origin: 'http://localhost:5173' }));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scenes', sceneRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'LightSimulator API is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});