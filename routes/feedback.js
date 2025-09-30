const express = require("express");
const router = express.Router();
const Feedback = require('.../models/Feedback') 
const feedbackController = require('../controllers/feedbackController');

const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

router.post('/',auth, requireRole("parent"), feedbackController.submitFeedback);
router.get('/',auth, requireRole("admin", "teacher"), feedbackController.getFeedbackByDate);

module.exports = router;