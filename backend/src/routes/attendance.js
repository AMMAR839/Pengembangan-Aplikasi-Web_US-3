const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

// GET semua absensi (admin/teacher only)
router.get("/", auth, requireRole("admin", "teacher"), async (req, res) => {
  try {
    const records = await Attendance.find();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET absensi parent sendiri (summary & details)
router.get("/my", auth, requireRole("parent", "admin"), async (req, res) => {
  try {
    // Return summary of attendance for parent's child
    // For now, return mock data structure that frontend expects
    const totalDays = 20;
    const presentDays = 19;
    
    res.json({
      totalDays,
      presentDays,
      absentDays: totalDays - presentDays,
      percentage: Math.round((presentDays / totalDays) * 100)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET detail absensi parent sendiri (list per hari)
router.get("/my-details", auth, requireRole("parent", "admin"), async (req, res) => {
  try {
    // Return detailed attendance records for parent's child
    // For now, return mock data that frontend expects
    const records = [];
    const today = new Date();
    for (let i = 19; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      records.push({
        date: date.toISOString().split('T')[0],
        status: Math.random() > 0.1 ? 'present' : 'absent'
      });
    }

    const presentDays = records.filter(r => r.status === 'present').length;
    const totalDays = records.length;

    res.json({
      records,
      totalDays,
      presentDays,
      absentDays: totalDays - presentDays,
      percentage: Math.round((presentDays / totalDays) * 100)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tambah absensi (admin/teacher only)
router.post("/", auth, requireRole("admin", "teacher"), async (req, res) => {
  try {
    const newRecord = new Attendance(req.body);
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
