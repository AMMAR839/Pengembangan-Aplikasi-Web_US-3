// src/server.js
require('dotenv').config();
require('./config/passport');

const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');
const express = require("express");
const cors = require("cors");
const app = express();

// --- CORS SETUP ---
const allowedOrigins = [
  "http://localhost:3000",
  "https://ini-bisa-91zz.vercel.app", // frontend kamu di Vercel
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow non-browser clients (postman/curl) yang nggak ada origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// supaya preflight OPTIONS ke semua route di-handle
app.options("*", cors());

// --- BODY PARSER ---
app.use(express.json());


app.set('trust proxy', true);


app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/admin',        require('./routes/admin'));

app.get('/api/healthz', (req, res) => res.send('OK'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

// ⬇️ TIDAK ADA app.listen
module.exports = app;
