const express = require("express");
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const {
  setDaySchedule,
  getScheduleTemplate,
  getDailySchedule,
  whatIsMyKidDoingNow,
  addDailySlotPhotos,
  deleteDailySlotPhoto,
  updateDailyPhotoCaption,
  getAllSchedules
} = require("../controllers/activityController");

// ==== Multer storage (seperti sebelumnya) ====
const destDir = path.join(process.cwd(), 'uploads', 'activities');
fs.mkdirSync(destDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, destDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});
const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Tipe file harus gambar (jpeg/png/webp/gif)'));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5*1024*1024, files: 10 } });

// ===== Jadwal =====
router.get("/", auth, getAllSchedules); // Get all schedules for admin
router.post("/jadwal", auth, requireRole("admin", "teacher"), setDaySchedule);
router.get("/jadwal", getScheduleTemplate);

// ===== LOG HARIAN =====
router.get("/daily", getDailySchedule);

// Parent/Admin/Teacher: apa yg sedang dilakukan sekarang (dari LOG)
router.get("/current", auth, requireRole("parent", "admin", "teacher"), whatIsMyKidDoingNow);

// Admin/Teacher: upload/hapus/update foto ke LOG HARIAN slot tertentu
router.post(
  "/daily/:logId/slots/:slotId/photos",
  auth, requireRole("admin", "teacher"),
  upload.array('photos', 10),
  addDailySlotPhotos
);
router.delete(
  "/daily/:logId/slots/:slotId/photos/:photoId",
  auth, requireRole("admin", "teacher"),
  deleteDailySlotPhoto
);
router.patch(
  "/daily/:logId/slots/:slotId/photos/:photoId",
  auth, requireRole("admin", "teacher"),
  updateDailyPhotoCaption
);

module.exports = router;
