require('dotenv').config();
require('./config/passport'); // Inisialisasi passport strategies

const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');
const http = require('http');



// Connect Database
connectDB();

const app = express();


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
app.use('/api/teacher',      require('./routes/teacher'));
app.use('/api/payment',      require('./routes/payment'));
app.use('/api/activities',   require('./routes/activities'));   
app.use('/api/attendance',   require('./routes/attendance'));
app.use('/api/message',      require('./routes/messages'));
app.use('/api/notification', require('./routes/notification'));
app.use('/api/weather',      require('./routes/weather'));
app.use('/api/feedback',     require('./routes/feedback'));
app.use('/api/gallery',      require('./routes/gallery'));
app.use('/api/admin',        require('./routes/admin'));



// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});


// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));
