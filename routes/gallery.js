const express = require("express");
const router = express.Router();
const Gallery = require('.../models/Gallery') 
const galleryController = require('../controllers/galleryController');
const upload = require('../middleware/upload');

const auth = require('../middleware/auth');
const { requireRole } = require("../middleware/roles");

router.post('/upload', auth, requireRole("admin", "teacher"), upload.single('photo'), galleryController.uploadPhoto);
router.get('/search', auth, requireRole("admin"), galleryController.searchPhotosByCaption);
router.patch('/:id/toggle', auth, requireRole("admin"), galleryController.toggleVisibility);
router.get("/", auth, galleryController.getAllPhotos);

module.exports = router;