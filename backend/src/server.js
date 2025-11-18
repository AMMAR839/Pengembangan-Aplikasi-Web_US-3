require('dotenv').config();
require('./config/passport'); // Inisialisasi passport strategies

const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');
const http = require('http');
const socketIO = require('socket.io');

const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes
app.locals.io = io;

// Penting kalau deploy di balik proxy (agar req.protocol = https saat perlu)
app.set('trust proxy', true);

// Middleware umum
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());


// Serve file statis untuk foto kegiatan
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/student',      require('./routes/student'));
app.use('/api/payment',      require('./routes/payment'));
app.use('/api/activities',   require('./routes/activities'));   
app.use('/api/attendance',   require('./routes/attendance'));
app.use('/api/message',      require('./routes/messages'));
app.use('/api/notification', require('./routes/notification'));
app.use('/api/weather',      require('./routes/weather'));
app.use('/api/feedback',     require('./routes/feedback'));
app.use('/api/gallery',      require('./routes/gallery'));
app.use('/api/admin',        require('./routes/admin'));

// Healthcheck sederhana
app.get('/healthz', (req, res) => res.send('OK'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
    
    // Also join role-based room if user has role in auth data
    // This will be used to broadcast role-specific notifications
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));
