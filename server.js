require('dotenv').config();
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log("✅ PORT:", process.env.PORT);
console.log("✅ MONGO_URI:", process.env.MONGO_URI);

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(()=>console.log('MongoDB Connected'))
  .catch(err=>console.error(err));

app.use('/api/auth', require('./routes/auth'));

app.listen(process.env.PORT, ()=>console.log('Server running'));

app.use('/api/activities', require('./routes/activities'));
app.use('/api/attendance', require('./routes/attendance'));