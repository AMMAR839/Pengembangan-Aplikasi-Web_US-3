const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// GET semua absensi
router.get("/", async (req, res) => {
  const records = await Attendance.find();
  res.json(records);
});

// POST tambah absensi
router.post("/", async (req, res) => {
  try {
    const newRecord = new Attendance(req.body);
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
