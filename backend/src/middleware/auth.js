const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.auth = async (req, res, next) => {
  try {
    const header = req.header('Authorization');
    const token = header?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Token tidak ada' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(401).json({ message: 'User tidak ditemukan' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};


exports.requireRole = (...allowed) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ message: 'Tidak diizinkan' });
  }
  next();
};

