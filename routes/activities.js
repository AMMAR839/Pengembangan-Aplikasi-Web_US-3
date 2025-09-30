const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");

const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

// GET semua kegiatan
router.get("/", async (req, res) => {
  const activities = await Activity.find();
  res.json(activities);
});

// POST tambah kegiatan
router.post("/", auth, requireRole("admin", "teacher"), async (req, res) => {
  try {
    const newActivity = new Activity(req.body);
    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
