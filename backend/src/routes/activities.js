const express = require("express");
const router = express.Router();
const multer = require("multer");

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
  getAllSchedules,
  getDailyDocsByStudent, 
} = require("../controllers/activityController");

// ============ MULTER UNTUK SUPABASE (pakai memoryStorage) ============
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error("Tipe file harus gambar (jpeg/png/webp/gif)"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // max 5MB, max 10 file
});

// ==================== JADWAL (TEMPLATE) ====================

// Admin/Teacher: lihat semua template jadwal
router.get(
  "/",
  auth,
  requireRole("admin", "teacher"),
  getAllSchedules
);

// Admin/Teacher: set / update template jadwal per hari
router.post(
  "/jadwal",
  auth,
  requireRole("admin", "teacher"),
  setDaySchedule
);

// Siapa saja (atau bisa ditambah auth kalau mau)
router.get("/jadwal", getScheduleTemplate);

// ==================== LOG HARIAN ====================

// admin/guru: ambil log harian per kelas & tanggal
router.get("/daily", auth, getDailySchedule);

// orang tua/admin/guru: lihat jadwal & foto HARI INI berdasar siswa
router.get(
  "/daily-by-student",
  auth,
  requireRole("parent", "admin", "teacher"),
  getDailyDocsByStudent
);

// orang tua/admin/guru: anak lagi ngapain sekarang (slot aktif + next)
router.get(
  "/current",
  auth,
  requireRole("parent", "admin", "teacher"),
  whatIsMyKidDoingNow
);

// ==================== FOTO DI LOG HARIAN ====================

// Admin/Teacher: upload foto ke slot di log harian
router.post(
  "/daily/:logId/slots/:slotId/photos",
  auth,
  requireRole("admin", "teacher"),
  upload.array("photos", 10),
  addDailySlotPhotos
);

// Admin/Teacher: hapus foto
router.delete(
  "/daily/:logId/slots/:slotId/photos/:photoId",
  auth,
  requireRole("admin", "teacher"),
  deleteDailySlotPhoto
);

// Admin/Teacher: update caption foto
router.patch(
  "/daily/:logId/slots/:slotId/photos/:photoId",
  auth,
  requireRole("admin", "teacher"),
  updateDailyPhotoCaption
);

module.exports = router;
