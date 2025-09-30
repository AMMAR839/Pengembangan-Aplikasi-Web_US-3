const mongoose = require('mongoose');

//Submit Feedback oleh Parent
exports.submitFeedback = async (req, res) => {
    try {
        const { parentUserId, feedback } = req.body;
        const newFeedback = new Feedback({ parentUserId, feedback });
        await newFeedback.save();
        res.status(201).json(newFeedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

//Mendapatkan feedback yang telah disubmit
exports.getFeedbackByDate = async (req, res) => {
    try {
        const { parentUserId } = req.params;
        const feedback = await Feedback.find().sort({ createdAt: -1 }).populate('parentId', 'nama');
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};