const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.auth = async (req,res,next)=>{
  try {
    const token = req.header('Authorization')?.replace('Bearer ','');
    if(!token) return res.status(401).json({ message:'Token tidak ada' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if(!user) return res.status(401).json({ message:'User tidak ditemukan' });
    req.user = user;
    next();
  } catch(err){
    res.status(401).json({ message:'Token tidak valid' });
  }
};

exports.isAdmin = (req,res,next)=>{
  if(req.user.role !== 'admin') return res.status(403).json({ message:'Hanya admin' });
  next();
};