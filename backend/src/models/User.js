const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ['user', 'admin', 'parent', 'teacher'],
      default: 'user',
    },

    googleId: { type: String, unique: true, sparse: true },

    //  field untuk verifikasi email
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
