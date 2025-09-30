const express = require("express");
const router = express.Router();
const feedback = require('.../models/Feedback') 
const feedbackController = require('../controllers/feedbackController');

router.post('/', feedbackController.submitFeedback);
router.get('/', feedbackController.getFeedbackByDate);

module.exports = router;
