const express = require("express");
const router = express.Router();
const Gallery = require('../models/Gallery') 
const galleryController = require('../controllers/galleryController');
const upload = require('../middleware/upload');

const { auth } = require('../middleware/auth');
const { requireRole } = require("../middleware/roles");

// GET all visible photos (for parents)
router.get("/", auth, galleryController.getAllPhotos);

// Admin/Teacher upload photo
router.post(
  '/upload',
  auth,
  requireRole("admin", "teacher"),
  upload.single('photo'),
  galleryController.uploadPhoto
);

// Admin search photos by caption
router.get('/search', auth, requireRole("admin"), galleryController.searchPhotosByCaption);

// Admin toggle photo visibility
router.patch('/:id/toggle', auth, requireRole("admin"), galleryController.toggleVisibility);

module.exports = router;
