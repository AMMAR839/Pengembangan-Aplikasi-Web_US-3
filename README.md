# Sistem Informasi PAUD — Backend API (README Ringkas)

## 1 Deskripsi Aplikasi
Aplikasi ini merupakan **backend REST API** untuk mendukung operasional harian PAUD. Fokusnya adalah menghubungkan **admin/guru** dan **orang tua** melalui alur data yang rapi: pendaftaran siswa, penjadwalan kegiatan, dokumentasi aktivitas harian (beserta foto), komunikasi dua arah, notifikasi realtime, serta pembayaran biaya pendaftaran yang aman. Seluruh akses dikendalikan oleh **role-based access control** sehingga setiap pengguna hanya bisa melakukan aksi sesuai perannya.

**Tujuan utama:** menyederhanakan administrasi PAUD, meningkatkan transparansi kegiatan harian anak kepada orang tua, dan mempercepat proses pembayaran/aktivasi siswa.

**Pengguna sasaran:** admin, guru, orang tua (dan akun user biasa yang belum menjadi parent).

**Alur kerja singkat:** Register/Login → Daftarkan siswa (NIK) → Lakukan pembayaran pendaftaran → Sistem mengaktifkan status siswa → Guru set template jadwal mingguan → Sistem membentuk log harian otomatis → Guru unggah foto per slot → Orang tua memantau "anak sedang apa" dan menerima notifikasi/pesan.

### Ruang Lingkup Fitur (Ringkas tapi Jelas)
- **Autentikasi & Otorisasi (JWT)**  
  Registrasi/login menghasilkan **token** yang dipakai di setiap permintaan (`Authorization: Bearer <JWT>`). Peran (`user`, `parent`, `teacher`, `admin`) menentukan apa yang boleh diakses.

- **Manajemen Siswa**  
  Orang tua mendaftarkan anak dengan **NIK 16 digit** (unik). Data inti seperti nama, tanggal lahir, alamat dan atribut opsional (golongan darah, jenis kelamin, agama, kontak orang tua) disimpan. Status mulai dari `pending` dan berubah ke `active` setelah pembayaran **settlement**.

- **Jadwal Kelas & Log Aktivitas Harian**  
  Guru/Admin menyusun **template jadwal** untuk kelas `A/B` (Senin–Jumat). Setiap hari, sistem membuat **log harian** dari template tersebut. Orang tua bisa melihat jadwal hari ini dan **slot yang sedang berlangsung/berikutnya** untuk anaknya.

- **Unggah Foto Aktivitas per Slot**  
  Guru/Admin dapat mengunggah beberapa foto ke **slot** tertentu (misal kegiatan mewarnai). Foto disimpan di `uploads/activities` dan bisa diberi **caption**. Orang tua melihat dokumentasi kegiatan anak secara kronologis.

- **Pesan Guru ↔ Orang Tua**  
  Guru/Admin mengirim **pesan** kepada orang tua terkait siswa tertentu (mis. catatan harian, pengingat). Orang tua membaca pesan di **inbox** miliknya.

- **Notifikasi Realtime (SSE)**  
  Admin dapat membuat **notifikasi** untuk semua pengguna, hanya orang tua, atau pengguna tertentu (by user). Client dapat **subscribe** ke endpoint **SSE** untuk menerima notifikasi baru secara langsung.

- **Pembayaran Pendaftaran (Midtrans Snap)**  
  Orang tua/Admin memulai checkout berdasarkan **NIK**. Jika ada transaksi **pending** yang masih valid, sistem **reuse** agar tidak ganda. Setelah Midtrans mengirim **callback** dengan status `settlement`, sistem otomatis mengubah **status siswa menjadi active** dan —bila perlu— mengubah **role** user menjadi `parent`.

- **Absensi & Cuaca (Contoh Integrasi)**  
  Tersedia endpoint **absensi** sederhana. Fitur **cuaca** (OpenWeatherMap) menunjukkan contoh integrasi API pihak ketiga yang dapat dikembangkan lebih lanjut (mis. untuk perencanaan kegiatan luar ruang).

- **Keandalan & Validasi**  
  Validasi jam `HH:MM`, hari `1..5`, kelas `A/B`, deteksi **bentrok slot**, masking NIK pada daftar siswa, serta indeks unik pada koleksi penting (mis. NIK, orderId) untuk menjaga konsistensi data.

- **Keamanan (Garis Besar)**  
  Kata sandi di-hash dengan **bcrypt**; rahasia seperti `JWT_SECRET` dan `MIDTRANS_SERVER_KEY` disimpan di `.env`. Akses file upload dibatasi mime & ukuran; file statis dilayani dari path khusus (`/uploads`).

- **Kinerja & Skalabilitas (Singkat)**  
  Desain **stateless** di layer API (berbasis JWT) memudahkan **horizontal scaling**. Upload foto disimpan di disk (dapat diarahkan ke object storage pada produksi). Notifikasi menggunakan SSE yang ringan dan mudah di-*scale out*.

Dengan cakupan tersebut, backend ini berperan sebagai **pondasi** yang mudah diintegrasikan ke aplikasi web/mobile frontend apa pun, sekaligus menjaga alur operasional PAUD tetap sederhana namun informatif.

---


## 2 Nama Kelompok & Anggota
- **Nama Kelompok**: _Kelompok ___________________
- **Anggota**:
  1. Ammar Ali Yasir (23/520644/TK/57406)
  2. Davana Nico Fadla (23/522338/TK/57649)
  3. Grace Anre Marcheline (23/522372/TK/57654)
  4. Mirsad Alganawi Azma (23/522716/TK/57737) 
  5. Muhammad Muqtada Alhaddad (22/500341/TK/54841)

---

## 3 Struktur Folder & File
Struktur mengikuti repo yang diberikan:
```
.
├─ config/
│  └─ db.js
├─ controllers/
│  ├─ activityController.js
│  ├─ authController.js
│  ├─ feedbackController.js
│  ├─ messageController.js
│  ├─ notificationController.js
│  ├─ paymentController.js
│  ├─ StudentController.js
│  └─ weatherController.js
├─ events/
│  └─ notificarions.js
├─ middleware/
│  ├─ auth.js
│  └─ roles.js
├─ models/
│  ├─ Activity.js
│  ├─ ActivityLog.js
│  ├─ Attendance.js
│  ├─ Feedback.js
│  ├─ Gallery.js
│  ├─ Message.JS
│  ├─ Notification,js
│  ├─ Payment.js
│  ├─ Student.js
│  └─ Users.js
├─ routes/
│  ├─ activities.js
│  ├─ attendance.js
│  ├─ auth.js
│  ├─ feedback.js
│  ├─ galery.js
│  ├─ messages.js
│  ├─ notifications.js
│  ├─ payment.js
│  ├─ student.js
│  └─ weather.js
└─ server.js
```


---

## 4 Teknologi yang Digunakan
- **Runtime & Web**: Node.js (LTS), Express
- **Database**: MongoDB, Mongoose
- **Auth**: JSON Web Token (`jsonwebtoken`), `bcrypt`
- **Upload**: `multer` (foto aktivitas), static files di `/uploads`
- **Pembayaran**: `midtrans-client` (Snap)
- **Cuaca** : 
- **Lainnya**: `axios`, `cors`, `dotenv`


---

## 5 URL GDrive Laporan
**GDrive Laporan**: https://drive.google.com/________________________________

---

