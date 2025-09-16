const express = require('express');
const { registerStudent } = require('../controllers/studentController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/register', auth, registerStudent);

module.exports = router;
