

# Little Garden

## Link Website : https://little-garden-5mlu.vercel.app/
## Link Video   : https://youtu.be/s0ScbBzwlkE?si=YGVmpE8K7MBbIves

## Username/Email dan Password Pengguna

'parent'
- ammar123
- enter123

'admin'
- dokumentasiworkshopkmteti@gmail.com
- dokumentasiworkshopkmteti@gmail.com

'user'
- graceanre903@gmail.com
- graceanre903@gmail.com 

## Nama Kelompok & Anggota
- **Kelompok 9** 
- **Anggota**:
  1. Ammar Ali Yasir (23/520644/TK/57406)
  2. Davana Nico Fadla (23/522338/TK/57649)
  3. Grace Anre Marcheline (23/522372/TK/57654)
  4. Mirsad Alganawi Azma (23/522716/TK/57737) 
  5. Muhammad Muqtada Alhaddad (22/500341/TK/54841)


## 1. BACKEND 

### 1.1. Install & jalanin

```bash
cd backend
npm install
npm run dev
```

### 1.2. File `.env` (di folder `backend`)

Buat file **`backend/.env`** isi minimal:

```env
PORT=5000

MONGO_URI=YOUR_MONGO_ATLAS_URI

MIDTRANS_SERVER_KEY=YOUR_MIDTRANS_SERVER_KEY
MIDTRANS_CLIENT_KEY=YOUR_MIDTRANS_CLIENT_KEY
MIDTRANS_IS_PROD=false
MIDTRANS_VERIFY_SIG=true
REGISTRATION_FEE=25000

JWT_SECRET=YOUR_JWT_SECRET_KEY

WEATHER_API_KEY=YOUR_WEATHER_API_KEY

NEXT_PUBLIC_API_URL=http://localhost:5000

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
FRONTEND_URL=http://localhost:3000

```


## 2. FRONTEND 

### 2.1. Install & jalanin

```bash
cd frontend
npm install
npm run dev
```

### 2.2. File `.env` (di folder `frontend`)

Buat file **`frontend/.env`**:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---


## 3. Urutan jalanin

1. Terminal 1:

   ```bash
   cd backend
   npm run dev
   ```
2. Terminal 2:

   ```bash
   cd frontend
   npm run dev
   ```

# Sistem Informasi PAUD 
Backend API 

## 1 Deskripsi Aplikasi

**Little Garden** adalah platform digital terintegrasi untuk manajemen PAUD yang menghubungkan **admin/guru** dan **orang tua** dalam satu ekosistem. Sistem ini menyediakan solusi lengkap dari pendaftaran siswa, manajemen kelas, dokumentasi aktivitas harian, komunikasi realtime, hingga pembayaran biaya pendaftaran secara aman.

### Visi & Misi
- **Visi:** Memodernisasi administrasi PAUD dan meningkatkan transparansi kegiatan anak kepada orang tua
- **Misi:** Menyederhanakan proses operasional, mempercepat aktivasi siswa, dan memfasilitasi komunikasi dua arah yang efektif

### Pengguna Sasaran
- **Admin:** Manajemen sistem, pembuatan template jadwal, verifikasi pembayaran
- **Guru/Pendidik:** Dokumentasi aktivitas harian, upload foto, mengirim pesan ke orang tua
- **Orang Tua:** Monitoring aktivitas anak, menerima notifikasi, pembayaran pendaftaran, komunikasi dengan guru
- **User Umum:** Registrasi dan login untuk menjadi parent

### Alur Kerja Utama
1. **Registrasi & Login** → Autentikasi JWT
2. **Pendaftaran Siswa** → Input data anak dengan NIK 16 digit
3. **Pembayaran** → Checkout via Midtrans (status pending → active)
4. **Penjadwalan** → Guru set template jadwal mingguan per kelas
5. **Log Harian** → Sistem generate otomatis dari template
6. **Dokumentasi** → Guru upload foto per aktivitas slot
7. **Monitoring** → Orang tua lihat jadwal & dokumentasi anak
8. **Komunikasi** → Guru kirim pesan & notifikasi realtime

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
  Orang tua/Admin memulai checkout berdasarkan **NIK**. Jika ada transaksi **pending** yang masih valid, sistem **reuse** agar tidak ganda. Setelah Midtrans mengirim **callback** dengan status `settlement`, sistem otomatis mengubah **status siswa menjadi active** dan mengubah **role** user menjadi `parent`.

- **Absensi & Cuaca (Contoh Integrasi)**  
  Tersedia endpoint **absensi** sederhana. Fitur **cuaca** (OpenWeatherMap) menunjukkan contoh integrasi API pihak ketiga.

- **Keamanan (Garis Besar)**  
  Kata sandi di-hash dengan **bcrypt**; rahasia seperti `JWT_SECRET` dan `MIDTRANS_SERVER_KEY` disimpan di `.env`. Akses file upload dibatasi mime & ukuran; file statis dilayani dari path khusus (`/uploads`).

- **Kinerja & Skalabilitas (Singkat)**  
  Desain **stateless** di layer API (berbasis JWT) memudahkan **horizontal scaling**. Upload foto disimpan di disk (dapat diarahkan ke object storage pada produksi). Notifikasi menggunakan SSE yang ringan dan mudah di-*scale out*.

Dengan cakupan tersebut, backend ini berperan sebagai **pondasi** yang mudah diintegrasikan ke aplikasi web/mobile frontend apa pun, sekaligus menjaga alur operasional PAUD tetap sederhana namun informatif.

---

## Frontend Documentation

### 1. Deskripsi Frontend

Frontend Little Garden dibangun menggunakan **Next.js** dengan **React** dan **Tailwind CSS**. Aplikasi ini menyediakan user interface yang responsif dan user-friendly untuk semua pengguna (admin, guru, dan orang tua) dengan fitur realtime notification dan context-based state management.

### 2. Struktur Folder Frontend

```
frontend/
├─ app/
│  ├─ layout.js                 # Root layout dengan NotificationInitializer
│  ├─ page.js                   # Halaman Login
│  ├─ globals.css               # Global styling
│  ├─ admin/
│  │  └─ page.js                # Dashboard Admin
│  ├─ auth/
│  │  └─ google/                # Google OAuth callback
│  ├─ components/
│  │  ├─ NotificationInitializer.js
│  │  ├─ NotificationList.js
│  │  ├─ TeacherManagement.js
│  │  ├─ Toast.js
│  │  └─ WeatherWidget.js
│  ├─ contexts/
│  │  └─ NotificationContext.js  # Global notification state
│  ├─ ganti-password/
│  │  └─ page.js                # Change password page
│  ├─ hooks/
│  │  └─ useNotification.js      # Custom hook untuk notifikasi
│  ├─ messages/
│  │  └─ page.js                # Messages page
│  ├─ pendaftaran-anak/
│  │  └─ page.js                # Student registration
│  ├─ profil/
│  │  └─ page.js                # User profile page
│  ├─ register/
│  │  └─ page.js                # Registration page
│  ├─ riwayat-pembayaran/
│  │  └─ page.js                # Payment history
│  ├─ reset-password/
│  │  └─ page.js                # Reset password page
│  ├─ verify-email/
│  │  └─ page.js                # Email verification
│  └─ wali-murid/
│     └─ page.js                # Parent dashboard
├─ lib/
│  └─ weather.js                # Weather API integration
├─ utils/
│  └─ date.js                   # Date utility functions
├─ public/
│  └─ images/                   # Static images
└─ next.config.mjs              # Next.js configuration
```

### 3. Fitur Utama Frontend

#### 3.1 Autentikasi & Manajemen User
- **Login/Register** - Dengan support Google OAuth
- **JWT Token Management** - Disimpan di localStorage
- **Password Management** - Change password & reset password
- **Email Verification** - Verifikasi email saat registrasi

#### 3.2 Dashboard & Manajemen
- **Admin Dashboard** - Overview sistem, manajemen user & guru
- **Guru Dashboard** - Input aktivitas harian, upload foto
- **Parent Dashboard** - Monitoring aktivitas anak, lihat jadwal

#### 3.3 Fitur Komunikasi
- **Messages** - Chat bidirectional antara guru dan orang tua
- **Notifications** - Notifikasi realtime via SSE
- **Toast Notifications** - UI feedback untuk user actions

#### 3.4 Manajemen Data
- **Student Registration** - Form pendaftaran anak dengan validasi NIK
- **Payment History** - Riwayat pembayaran & status aktivasi
- **User Profile** - Edit profil user

#### 3.5 Integrasi Eksternal
- **Weather Widget** - Display cuaca lokal
- **Google OAuth** - Login dengan akun Google
- **Midtrans Payment** - Integrasi payment gateway

### 4. Teknologi Frontend
- **Framework** : Next.js 16.0.1 (Turbopack)
- **UI Library** : React 19
- **Styling** : Tailwind CSS
- **State Management** : React Context + Hooks
- **HTTP Client** : Fetch API
- **Realtime** : Server-Sent Events (SSE)
- **Validation** : Client-side form validation

### 5. Context & Hooks

#### 5.1 NotificationContext
```javascript
// Menyediakan state global untuk notifikasi
// Methods: addNotification, removeNotification, clearNotifications
```

#### 5.2 useNotification Hook
```javascript
// Custom hook untuk subscribe ke notifikasi realtime
// Otomatis connect/disconnect SSE
```

### 6. Environment Variables (Frontend)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 7. Styling & CSS Modules

Frontend menggunakan kombinasi:
- **Tailwind CSS** - Utility-first CSS framework
- **CSS Modules** - Scoped styling untuk komponenen tertentu
  - `Login.module.css`
  - `Register.module.css`
  - `NotificationList.module.css`
  - `Toast.module.css`
  - `GantiPassword.module.css`
  - `Profil.module.css`
  - `PendaftaranAnak.module.css`

### 8. Cara Menjalankan Frontend

```bash
# Navigate ke folder frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build untuk production
npm run build

# Run production build
npm start
```

Akses di: `http://localhost:3000`

### 9. Flow Navigasi Aplikasi

```
Login/Register
    ↓
Google OAuth (opsional)
    ↓
Dashboard (sesuai role)
    ├─ Admin → Manajemen, TeacherManagement
    ├─ Guru → Upload aktivitas, pesan
    └─ Orang Tua → Monitor anak, lihat jadwal & foto
    ↓
Fitur Lainnya
    ├─ Messages
    ├─ Notifications
    ├─ Payment History
    ├─ Profile
    └─ Settings (Ganti Password, Reset Password)
```

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
- **Runtime & Web** : Node.js (LTS), Express
- **Database**      : MongoDB, Mongoose
- **Auth**          : JSON Web Token (`jsonwebtoken`), `bcrypt`
- **Upload**        : `multer` (foto aktivitas), static files di `/uploads`
- **Pembayaran**    : `midtrans-client` (Snap)
- **Cuaca**         : WeatherAPI.com (Current Weather API) via `axios`
- **Realtime**      : EventEmitter + Server-Sent Events (SSE)
- **Lainnya**       : `cors` & `dotenv`


---

## 5 URL GDrive Laporan
**GDrive Laporan**: https://drive.google.com/file/d/1so8W-tAYMyQ3M6xvv2JJ5TknM4WJ4Lrj/view?usp=sharing

---

