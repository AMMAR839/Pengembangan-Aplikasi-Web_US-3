require('dotenv').config();

const mongoose = require('mongoose');
const notification =require('./models/Notification');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log("✅ PORT:", process.env.PORT);
console.log("✅ MONGO_URI:", process.env.MONGO_URI);


const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/payment', require('./routes/payment'));

app.listen(process.env.PORT, ()=>console.log('Server running'));

app.use('/api/activities', require('./routes/activities'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/notification', require('./routes/notification'));

app.listen(process.env.PORT, () => console.log('Server running on port ' + process.env.PORT));

