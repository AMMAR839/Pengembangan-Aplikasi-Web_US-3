require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

const app = express();

// Penting kalau deploy di balik proxy (agar req.protocol = https saat perlu)
app.set('trust proxy', true);

// Middleware umum
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
require('dotenv').config();

// Serve dile statis untuk foto kegiatan

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/student',      require('./routes/student'));
app.use('/api/payment',      require('./routes/payment'));
app.use('/api/activities',   require('./routes/activities'));   // <-- jadwal + foto harian
app.use('/api/attendance',   require('./routes/attendance'));
app.use('/api/message',      require('./routes/messages'));
app.use('/api/notification', require('./routes/notification'));
app.use('/api/weather',      require('./routes/weather'));

// Healthcheck sederhana
app.get('/healthz', (req, res) => res.send('OK'));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
