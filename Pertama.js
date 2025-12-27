const fs = require('fs');
const path = require('path');

const folders = [
  'config',
  'models',
  'routes',
  'controllers',
  'middleware'
];

const files = {
  '.env': `PORT=5000\nMONGO_URI=mongodb://localhost:27017/mydb\nJWT_SECRET=secret123`,
  'server.js': 
`require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(()=>console.log('MongoDB Connected'))
  .catch(err=>console.error(err));

app.use('/api/auth', require('./routes/auth'));

app.listen(process.env.PORT, ()=>console.log('Server running'));
`,
  'config/db.js':
`const mongoose = require('mongoose');
module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};`,
  'models/User.js':
`const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user','admin'], default: 'user' }
});
module.exports = mongoose.model('User', userSchema);`,
  'routes/auth.js':
`const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
router.post('/login', login);
module.exports = router;`,
  'controllers/authController.js':
`const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req,res)=>{
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if(!user) return res.status(400).json({ message:'User tidak ditemukan' });
    const match = await bcrypt.compare(password, user.password);
    if(!match) return res.status(400).json({ message:'Password salah' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username: user.username, role: user.role });
  } catch(err){
    res.status(500).json({ message: err.message });
  }
};`,
  'middleware/auth.js':
`const jwt = require('jsonwebtoken');
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
};`
};

// Buat folder
folders.forEach(f => {
  if (!fs.existsSync(f)) fs.mkdirSync(f);
});

// Buat file
for (const [name, content] of Object.entries(files)) {
  const dir = path.dirname(name);
  if (dir !== '.' && !fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(name, content);
}

console.log('✅ Template Express.js berhasil dibuat!');
