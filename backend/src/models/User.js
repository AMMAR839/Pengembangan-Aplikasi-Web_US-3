const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user','admin','parent','teacher'], default: 'user' },
  googleId: { type: String,unique: true, sparse: true },
});

module.exports = mongoose.model('User', userSchema);
