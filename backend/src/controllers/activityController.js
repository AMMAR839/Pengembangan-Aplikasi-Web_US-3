const path = require("path");
const Activity = require("../models/Activity");
const ActivityLog = require("../models/ActivityLog");
const Student = require("../models/Student");
const supabase = require("../config/supabase");

// ===== Helper kecil =====
const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

function normalizeDateOnly(d) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) throw new Error("date tidak valid");
  dt.setHours(0, 0, 0, 0);
  return dt;
}

// ================== TEMPLATE JADWAL ==================

// Buat/ubah template jadwal per hari (admin/teacher)
exports.setDaySchedule = async (req, res) => {
  try {
    const { className, dayOfWeek, slots = [] } = req.body;

    if (!["A", "B"].includes(className)) {
      return res
        .status(400)
        .json({ message: "className harus 'A' atau 'B'" });
    }

    const day = Number(dayOfWeek);
    if (![1, 2, 3, 4, 5].includes(day)) {
      return res
        .status(400)
        .json({ message: "dayOfWeek harus 1..5 (Senin=1)" });
    }

    // validasi jam & bentrok
    const s = [...slots]
      .map((x) => ({ ...x, _s: toMin(x.start), _e: toMin(x.end) }))
      .sort((a, b) => a._s - b._s);

    for (let i = 0; i < s.length; i++) {
      const it = s[i];
      if (isNaN(it._s) || isNaN(it._e) || it._s >= it._e) {
        throw new Error(`Slot invalid: ${it.title || "(tanpa judul)"}`);
      }
      if (i > 0 && s[i - 1]._e > it._s) {
        throw new Error(
          `Bentrok jadwal: "${s[i - 1].title}" vs "${it.title}"`
        );
      }
    }

    const cleanSlots = s.map(({ _s, _e, ...rest }) => rest);

    const doc = await Activity.findOneAndUpdate(
      { className, dayOfWeek: day },
      { $set: { slots: cleanSlots, createdBy: req.user._id } },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ message: "Jadwal disimpan", data: doc });
  } catch (err) {
    console.error("setDaySchedule error:", err);
    res.status(400).json({ message: err.message });
  }
};

// Ambil template jadwal per hari
exports.getScheduleTemplate = async (req, res) => {
  try {
    let { class: cls, day } = req.query;

    if (!cls || !["A", "B"].includes(cls)) {
      return res.status(400).json({ message: "query class=A|B wajib" });
    }

    const d = Number(day);
    if (![1, 2, 3, 4, 5].includes(d)) {
      return res.status(400).json({ message: "day harus 1..5" });
    }

    const doc = await Activity.findOne({ className: cls, dayOfWeek: d }).lean();
    res.json(doc || { className: cls, dayOfWeek: d, slots: [] });
  } catch (err) {
    console.error("getScheduleTemplate error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================== LOG HARIAN ==================

// Buat log harian dari template (kalau belum ada)
async function ensureDailyLog(className, rawDate) {
  // Normalisasi ke awal hari (00:00)
  const start = normalizeDateOnly(rawDate);

  // Besok 00:00
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 1);

  const dayMap = [7, 1, 2, 3, 4, 5, 6]; // JS 0..6 -> 1..7
  const w = dayMap[start.getDay()];
  if (![1, 2, 3, 4, 5].includes(w)) {
    throw new Error("Tidak ada jadwal (akhir pekan)");
  }

  // 🔎 Cari log berdasarkan RANGE tanggal
  let log = await ActivityLog.findOne({
    className,
    date: { $gte: start, $lt: end },
  });

  if (log) {
    return log;
  }

  const tpl = await Activity.findOne({ className, dayOfWeek: w }).lean();

  if (!tpl) {
    // kalau tidak ada template, buat log kosong (slots: [])
    log = await ActivityLog.create({
      className,
      date: start,
      dayOfWeek: w,
      templateId: null,
      slots: [],
    });
    return log;
  }

  // copy slot template → isi tplSlotId
  const copiedSlots = (tpl.slots || []).map((s) => ({
    tplSlotId: s._id,
    start: s.start,
    end: s.end,
    title: s.title,
    note: s.note,
    photos: [],
  }));

  log = await ActivityLog.create({
    className,
    date: start,
    dayOfWeek: w,
    templateId: tpl._id,
    slots: copiedSlots,
  });

  return log;
}

// GET jadwal harian by class & date (untuk admin/guru)
exports.getDailySchedule = async (req, res) => {
  try {
    let { class: cls, date } = req.query;

    if (!cls || !["A", "B"].includes(cls)) {
      return res.status(400).json({ message: "query class=A|B wajib" });
    }
    if (!date) {
      return res.status(400).json({ message: "query date=YYYY-MM-DD wajib" });
    }

    const d = normalizeDateOnly(date);
    const log = await ensureDailyLog(cls, d);

    res.json(log);
  } catch (err) {
    console.error("getDailySchedule error:", err);
    res.status(400).json({ message: err.message });
  }
};

// ================== ORANG TUA: JADWAL HARI INI + FOTO ==================

exports.getDailyDocsByStudent = async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ message: "studentId wajib" });
    }

    const filter = { _id: studentId };
    if (req.user.role === "parent") {
      filter.parentUserId = req.user._id;
    }

    const stu = await Student.findOne(filter).select("nama kelas").lean();
    if (!stu) {
      return res
        .status(404)
        .json({ message: "Siswa tidak ditemukan / bukan milik Anda" });
    }

    if (!["A", "B"].includes(stu.kelas)) {
      return res
        .status(400)
        .json({ message: "Siswa belum memiliki kelas (A/B)" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let log;
    try {
      log = await ensureDailyLog(stu.kelas, today);
    } catch (e) {
      return res.status(200).json({
        student: { id: stu._id, nama: stu.nama, kelas: stu.kelas },
        date: today,
        className: stu.kelas,
        slots: [],
        message: "Tidak ada jadwal (akhir pekan / belum diinput)",
      });
    }

    // 🔎 DEBUG: log dikirim ke console server
    console.log("DAILY DOCS LOG ID:", log._id?.toString());
    console.log(
      "DAILY DOCS SLOTS PHOTOS:",
      (log.slots || []).map((s) => ({
        title: s.title,
        photosCount: (s.photos || []).length,
      }))
    );

    res.json({
      student: { id: stu._id, nama: stu.nama, kelas: stu.kelas },
      date: log.date,
      className: log.className,
      slots: log.slots || [],
      // field tambahan ini cuma buat debugging, front-end kamu bisa cuekin
      debug: {
        logId: log._id,
        photosInfo: (log.slots || []).map((s) => ({
          title: s.title,
          photosCount: (s.photos || []).length,
        })),
      },
    });
  } catch (err) {
    console.error("getDailyDocsByStudent error:", err);
    res.status(500).json({ message: err.message });
  }
};

// "Anak saya sekarang lagi ngapain?"
exports.whatIsMyKidDoingNow = async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ message: "studentId wajib" });
    }

    const filter = { _id: studentId };
    if (req.user.role === "parent") {
      filter.parentUserId = req.user._id;
    }

    const stu = await Student.findOne(filter).select("nama kelas").lean();
    if (!stu) {
      return res
        .status(404)
        .json({ message: "Siswa tidak ditemukan / bukan milik Anda" });
    }
    if (!["A", "B"].includes(stu.kelas)) {
      return res.status(400).json({ message: "Siswa belum punya kelas" });
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    let log;
    try {
      log = await ensureDailyLog(stu.kelas, today);
    } catch {
      return res.json({
        student: stu.nama,
        className: stu.kelas,
        now: now.toISOString(),
        activity: null,
        message: "Tidak ada jadwal (akhir pekan)",
      });
    }

    const curMin = now.getHours() * 60 + now.getMinutes();
    const current =
      (log.slots || []).find(
        (s) => toMin(s.start) <= curMin && curMin < toMin(s.end)
      ) || null;
    const next =
      (log.slots || []).find((s) => toMin(s.start) >= curMin) || null;

    res.json({
      student: stu.nama,
      className: stu.kelas,
      date: today.toISOString(),
      now: now.toISOString(),
      activity: current,
      next,
    });
  } catch (err) {
    console.error("whatIsMyKidDoingNow error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================== FOTO KEGIATAN (SUPABASE) ==================

exports.addDailySlotPhotos = async (req, res) => {
  try {
    const { logId, slotId } = req.params;

    const log = await ActivityLog.findById(logId);
    if (!log) {
      return res.status(404).json({ message: "Log harian tidak ditemukan" });
    }

    const slot = log.slots.id(slotId);
    if (!slot) {
      return res
        .status(404)
        .json({ message: "Slot pada log tidak ditemukan" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Tidak ada file foto" });
    }

    let captions = [];
    if (req.body.captions) {
      try {
        captions = JSON.parse(req.body.captions);
      } catch {
        captions = [];
      }
    }

    const uploadedPhotos = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const ext = path.extname(file.originalname) || ".jpg";

      const safeClass = (log.className || "X").toString();
      const datePart = log.date
        ? log.date.toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);
      const random = Math.random().toString(36).slice(2);
      const fileName = `activities/${safeClass}/${datePart}-${Date.now()}-${random}${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("Foto_Activity") // pastikan BUCKET ini ada di Supabase
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return res
          .status(500)
          .json({ message: "Gagal upload foto ke Supabase Storage" });
      }

      const { data: publicData } = supabase.storage
        .from("Foto_Activity")
        .getPublicUrl(uploadData.path || fileName);

      const publicUrl = publicData.publicUrl;

      uploadedPhotos.push({
        url: publicUrl,
        caption: Array.isArray(captions) ? captions[i] || "" : "",
        uploadedBy: req.user._id,
      });
    }

    slot.photos.push(...uploadedPhotos);
    await log.save();

    res.status(201).json({ message: "Foto ditambahkan", photos: slot.photos });
  } catch (err) {
    console.error("addDailySlotPhotos error:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.deleteDailySlotPhoto = async (req, res) => {
  try {
    const { logId, slotId, photoId } = req.params;

    const log = await ActivityLog.findById(logId);
    if (!log) {
      return res.status(404).json({ message: "Log harian tidak ditemukan" });
    }

    const slot = log.slots.id(slotId);
    if (!slot) {
      return res
        .status(404)
        .json({ message: "Slot pada log tidak ditemukan" });
    }

    const before = slot.photos.length;
    slot.photos = slot.photos.filter(
      (p) => String(p._id) !== String(photoId)
    );

    if (slot.photos.length === before) {
      return res.status(404).json({ message: "Photo tidak ditemukan" });
    }

    await log.save();
    res.json({ message: "Foto dihapus" });
  } catch (err) {
    console.error("deleteDailySlotPhoto error:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.updateDailyPhotoCaption = async (req, res) => {
  try {
    const { logId, slotId, photoId } = req.params;
    const { caption } = req.body;

    const log = await ActivityLog.findById(logId);
    if (!log) {
      return res.status(404).json({ message: "Log harian tidak ditemukan" });
    }

    const slot = log.slots.id(slotId);
    if (!slot) {
      return res
        .status(404)
        .json({ message: "Slot pada log tidak ditemukan" });
    }

    const photo = slot.photos.id(photoId);
    if (!photo) {
      return res.status(404).json({ message: "Photo tidak ditemukan" });
    }

    photo.caption = caption || "";
    await log.save();

    res.json({ message: "Caption diperbarui", photo });
  } catch (err) {
    console.error("updateDailyPhotoCaption error:", err);
    res.status(400).json({ message: err.message });
  }
};

// ================== ADMIN: LIST SEMUA TEMPLATE ==================

exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Activity.find().lean();
    res.json(schedules || []);
  } catch (err) {
    console.error("getAllSchedules error:", err);
    res.status(500).json({ message: err.message });
  }
};
