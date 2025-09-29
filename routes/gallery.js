const express = require("express");
const router = express.Router();
const feedback = require('.../models/Gallery') 
const feedbackController = require('../controllers/galleryController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', auth, upload.single('photo'), galleryController.uploadPhoto);


module.exports = router;