const path = require('path');
const Activity = require('../models/Activity');
const ActivityLog = require('../models/ActivityLog');
const Student  = require('../models/Student');

const toMin = (hhmm) => { const [h,m]=hhmm.split(':').map(Number); return h*60+m; };

function normalizeDateOnly(d) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) throw new Error('date tidak valid');
  dt.setHours(0,0,0,0);
  return dt;
}

// Buat/ubah template jadwal per hari (admin/teacher)
exports.setDaySchedule = async (req, res) => {
  try {
    const { className, dayOfWeek, slots = [] } = req.body;
    if (!['A','B'].includes(className)) return res.status(400).json({ message: 'className harus A/B' });
    if (![1,2,3,4,5].includes(Number(dayOfWeek))) return res.status(400).json({ message: 'dayOfWeek 1..5' });

    // validasi sederhana non-overlap
    const s = [...slots].map(x => ({...x,_s:toMin(x.start),_e:toMin(x.end)})).sort((a,b)=>a._s-b._s);
    for (let i=0;i<s.length;i++){
      const it=s[i]; if (isNaN(it._s) || isNaN(it._e) || it._s>=it._e) throw new Error(`Slot invalid: ${it.title}`);
      if (i>0 && s[i-1]._e > it._s) throw new Error(`Bentrok: ${s[i-1].title} vs ${it.title}`);
    }
    const clean = s.map(({_s,_e,...r})=>r);

    const doc = await Activity.findOneAndUpdate(
      { className, dayOfWeek },
      { $set: { slots: clean, createdBy: req.user._id } },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json({ message: 'Jadwal disimpan', data: doc });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Ambil template jadwal per hari (siapa saja)
exports.getScheduleTemplate = async (req, res) => {
  try {
    let { class: cls, day } = req.query;
    if (!cls || !['A','B'].includes(cls)) return res.status(400).json({ message: 'query class=A|B wajib' });
    const d = Number(day);
    if (![1,2,3,4,5].includes(d)) return res.status(400).json({ message: 'day 1..5' });
    const doc = await Activity.findOne({ className: cls, dayOfWeek: d }).lean();
    res.json(doc || { className: cls, dayOfWeek: d, slots: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========= LOG HARIAN =========

// Buat (atau ambil) log harian dari template
async function ensureDailyLog(className, date) {
  const dayMap = [7,1,2,3,4,5,6]; // JS 0..6 -> 1..7
  const w = dayMap[new Date(date).getDay()];
  if (![1,2,3,4,5].includes(w)) throw new Error('Tidak ada jadwal akhir pekan');

  let log = await ActivityLog.findOne({ className, date });
  if (log) return log;

  // Cari template hari itu
  const tpl = await Activity.findOne({ className, dayOfWeek: w });
  if (!tpl) {
    // buat log kosong (supaya upload foto tetap bisa, meskipun tanpa slot)
    log = await ActivityLog.create({ className, date, dayOfWeek: w, templateId: null, slots: [] });
    return log;
  }

  // copy slot ke log, simpan tplSlotId
  const copiedSlots = (tpl.slots || []).map(s => ({
    tplSlotId: s._id,
    start: s.start,
    end: s.end,
    title: s.title,
    note: s.note
  }));

  log = await ActivityLog.create({
    className,
    date,
    dayOfWeek: w,
    templateId: tpl._id,
    slots: copiedSlots
  });
  return log;
}

// GET jadwal harian by class & date
exports.getDailySchedule = async (req, res) => {
  try {
    let { class: cls, date } = req.query;
    if (!cls || !['A','B'].includes(cls)) return res.status(400).json({ message: 'query class=A|B wajib' });
    if (!date) return res.status(400).json({ message: 'query date=YYYY-MM-DD wajib' });
    const d = normalizeDateOnly(date);

    const log = await ensureDailyLog(cls, d);
    res.json(log);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PARENT: anak lagi ngapain sekarang?
exports.whatIsMyKidDoingNow = async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) return res.status(400).json({ message: 'studentId wajib' });

    const filter = { _id: studentId };
    if (req.user.role === 'parent') filter.parentUserId = req.user._id;

    const stu = await Student.findOne(filter).select('nama kelas').lean();
    if (!stu) return res.status(404).json({ message: 'Siswa tidak ditemukan/bukan milik Anda' });
    if (!['A','B'].includes(stu.kelas)) return res.status(400).json({ message: 'Siswa belum punya kelas' });

    const now = new Date();
    const today = new Date(now); today.setHours(0,0,0,0);

    let log;
    try { log = await ensureDailyLog(stu.kelas, today); }
    catch { return res.json({ student: stu.nama, className: stu.kelas, now: now.toISOString(), activity: null, message: 'Tidak ada jadwal (akhir pekan)' }); }

    const curMin = now.getHours()*60 + now.getMinutes();
    const current = (log.slots || []).find(s => toMin(s.start) <= curMin && curMin < toMin(s.end)) || null;
    const next    = (log.slots || []).find(s => toMin(s.start) >= curMin) || null;

    res.json({
      student: stu.nama,
      className: stu.kelas,
      date: today.toISOString(),
      now: now.toISOString(),
      activity: current, // sudah termasuk photos[]
      next
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload foto ke slot di log harian
exports.addDailySlotPhotos = async (req, res) => {
  try {
    const { logId, slotId } = req.params;
    const log = await ActivityLog.findById(logId);
    if (!log) return res.status(404).json({ message: 'Log harian tidak ditemukan' });

    const slot = log.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot pada log tidak ditemukan' });

    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'Tidak ada file foto' });

    let captions = [];
    if (req.body.captions) { try { captions = JSON.parse(req.body.captions); } catch {} }

    const base = `${req.protocol}://${req.get('host')}`;
    const newPhotos = req.files.map((f, i) => ({
      url: `${base}/uploads/activities/${path.basename(f.filename)}`,
      caption: Array.isArray(captions) ? captions[i] : undefined,
      uploadedBy: req.user._id
    }));

    slot.photos.push(...newPhotos);
    await log.save();

    res.status(201).json({ message: 'Foto ditambahkan', photos: slot.photos });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Hapus foto dari slot di log harian
exports.deleteDailySlotPhoto = async (req, res) => {
  try {
    const { logId, slotId, photoId } = req.params;
    const log = await ActivityLog.findById(logId);
    if (!log) return res.status(404).json({ message: 'Log harian tidak ditemukan' });

    const slot = log.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot pada log tidak ditemukan' });

    const before = slot.photos.length;
    slot.photos = slot.photos.filter(p => String(p._id) !== String(photoId));
    if (slot.photos.length === before) return res.status(404).json({ message: 'Photo tidak ditemukan' });

    await log.save();
    res.json({ message: 'Foto dihapus' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update caption foto di slot log harian
exports.updateDailyPhotoCaption = async (req, res) => {
  try {
    const { logId, slotId, photoId } = req.params;
    const { caption } = req.body;

    const log = await ActivityLog.findById(logId);
    if (!log) return res.status(404).json({ message: 'Log harian tidak ditemukan' });

    const slot = log.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot pada log tidak ditemukan' });

    const photo = slot.photos.id(photoId);
    if (!photo) return res.status(404).json({ message: 'Photo tidak ditemukan' });

    photo.caption = caption || '';
    await log.save();
    res.json({ message: 'Caption diperbarui', photo });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all schedules (for admin dashboard)
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Activity.find().lean();
    res.json(schedules || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
