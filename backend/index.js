const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const http = require('http');
const { initializeSocket } = require('./socket'); 
const authRoutes = require('./routes/authRoutes'); 
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app); 

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdb';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/chat', chatRoutes);

// Initialize Socket.io
initializeSocket(server);

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
