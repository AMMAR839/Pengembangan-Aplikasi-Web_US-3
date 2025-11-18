const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder ada
const uploadDir = path.join(process.cwd(), 'uploads', 'gallery');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Simpan ke uploads/gallery/
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let ext = path.extname(file.originalname);
        // Fallback jika extension tidak terdeteksi
        if (!ext) {
            if (file.mimetype === 'image/jpeg') ext = '.jpg';
            else if (file.mimetype === 'image/png') ext = '.png';
            else ext = '.jpg';
        }
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Filter file agar hanya menerima gambar
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar yang diperbolehkan'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
