const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.auth = async (req, res, next) => {
  try {
    const header = req.header('Authorization');
    const token = header?.replace('Bearer ', '');
    console.log(`[AUTH] Request to ${req.method} ${req.path} - Token present: ${!!token}`);
    
    if (!token) return res.status(401).json({ message: 'Token tidak ada' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log(`[AUTH] User not found in DB for token: ${decoded.id}`);
      return res.status(401).json({ message: 'User tidak ditemukan' });
    }

    console.log(`[AUTH] User authenticated: ${user.username} (role: ${user.role})`);
    req.user = user;
    next();
  } catch (err) {
    console.error(`[AUTH] Error: ${err.message}`);
    res.status(401).json({ message: 'Token tidak valid' });
  }
};


exports.requireRole = (...allowed) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  console.log(`[AUTH] User role check - User: ${req.user.username}, Role: ${req.user.role}, Allowed: [${allowed.join(', ')}]`);
  if (!allowed.includes(req.user.role)) {
    console.log(`[AUTH] REJECTED - User role ${req.user.role} not in allowed roles`);
    return res.status(403).json({ message: 'Tidak diizinkan' });
  }
  console.log(`[AUTH] APPROVED - User role ${req.user.role} is allowed`);
  next();
};

