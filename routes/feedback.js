const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const {
  submitFeedback,
  listFeedback,
  listMyFeedback
} = require('../controllers/feedbackController');

// Parent: submit feedback
router.post('/', auth, requireRole("parent"), submitFeedback);

// Admin/Teacher: lihat semua feedback (support ?from=&to=&parentId=)
router.get('/', auth, requireRole("admin", "teacher"), listFeedback);

// Parent: lihat feedback miliknya sendiri
router.get('/my', auth, requireRole("parent"), listMyFeedback);

module.exports = router;
