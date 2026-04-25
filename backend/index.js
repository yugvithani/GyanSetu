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
const generateMaterialRoutes = require('./routes/materialRoutes');
// const searchRoutes = require('./routes/sea');
const activityRoutes = require('./routes/activityRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middlewares/errorHandler');
const rateLimit = require('express-rate-limit');
const logger = require('./middlewares/logger');
const cookieParser = require('cookie-parser');

const app = express();

// Security: Global API Rate Limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

app.use(globalLimiter);
const server = http.createServer(app); 

// Enable CORS with Credentials
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json()); // Parses incoming request body
app.use(cookieParser()); // Parses cookies from incoming requests

// Observability: HTTP Logger
app.use(logger);

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdb';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/materials', generateMaterialRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/tasks', taskRoutes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Initialize Socket.io
initializeSocket(server);

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
