
## Daftar Isi

* [Fitur](#fitur)
* [Arsitektur & Alur](#arsitektur--alur)
* [Database Schema (ERD)](#database-schema-erd)
* [Persyaratan](#persyaratan)
* [Instalasi & Menjalankan](#instalasi--menjalankan)
* [Konfigurasi Lingkungan (.env)](#konfigurasi-lingkungan-env)
* [Struktur Direktori](#struktur-direktori)
* [Model Data](#model-data)
* [Autentikasi](#autentikasi)
* [Endpoint API](#endpoint-api)
  * [Auth](#auth)
  * [Students (pendaftaran siswa)](#students-pendaftaran-siswa)
  * [Payments (Midtrans)](#payments-midtrans)
  * [Notifications](#notifications)
  * [Messages](#messages)
  * [Weather](#weather)
  * [Activities](#activities)
  * [Attendance](#attendance)
* [Notifikasi Realtime (SSE)](#notifikasi-realtime-sse)
* [Menyiapkan Admin](#menyiapkan-admin)
* [Tips Keamanan & Produksi](#tips-keamanan--produksi)
* [Troubleshooting](#troubleshooting)
* [Lisensi](#lisensi)
* [Catatan](#catatan)

---

## Fitur

* **Auth JWT**: register & login (roles: `user`, `parent`, `admin`).
* **Pendaftaran Siswa**: orangtua mendaftarkan anak; NIK unik & bisa dimasking saat listing.
* **Pembayaran Pendaftaran**: integrasi **Midtrans Snap** (`qris`), callback memperbarui status.
* **Perubahan Peran Otomatis**: ketika pembayaran `settlement`, user menjadi `parent`, siswa `active`.
* **Notifikasi**: buat (admin), baca (user/parent), tandai `read`, dan stream realtime (SSE).
* **Pesan**: admin dapat kirim pesan ke orangtua terkait seorang siswa; orangtua punya inbox.
* **Aktivitas & Absensi**: CRUD sederhana (create + list).
* **Cuaca**: ambil cuaca kota via OpenWeatherMap.

---

## Arsitektur & Alur

1. **User** mendaftar ➜ login ➜ mendapatkan **JWT**.
2. **User** mendaftarkan **siswa** (status `pending`).
3. **User** meminta link bayar (single/batch NIK) ➜ diarahkan ke **Midtrans Snap**.
4. Setelah bayar, **Midtrans** memanggil **callback** ➜ sistem set **payment.status=settlement**, **student.status=active**, **user.role=parent**.
5. **Admin** bisa membuat **notifikasi** (untuk semua, parent saja, atau user tertentu); klien bisa berlangganan **SSE**.
6. **Admin** kirim **pesan** ke orangtua terkait siswa; orangtua melihat **inbox**.

---

## Database Schema (ERD)

![Entity Relationship Diagram](./img/entity.svg)

*Diagram ERD menunjukkan struktur database dan relasi antar tabel dalam sistem TK*

### Entitas Utama:
- **User**: Data pengguna (orang tua, guru, admin)
- **Student**: Data anak TK yang terdaftar
- **Class**: Kelas berdasarkan kelompok usia
- **Teacher**: Data guru dan staff TK
- **DailyActivity**: Kegiatan harian (senam pagi, bermain, bercerita, makan siang, pulang)
- **Attendance**: Absensi harian siswa
- **Payment**: Pembayaran pendaftaran
- **Event**: Acara TK (pertemuan orang tua, acara tahunan)
- **ParentNotification**: Sistem notifikasi untuk orang tua
- **WeatherAlert**: Peringatan cuaca
- **Schedule**: Jadwal kegiatan (Senin-Rabu)


### b. Admin
- **Buat akun admin** secara manual di database MongoDB (role: admin)
- **Login** sebagai admin
- **Melihat seluruh data anak dan status pembayaran**


## Persyaratan

* **Node.js** v18+ (disarankan LTS)
* **MongoDB** 5+ (lokal/Atlas)
* Akun **Midtrans** (Snap), **Server Key**
* **OpenWeatherMap API Key**

---

## Instalasi & Menjalankan

```bash
git clone <repo-url>
cd <nama-proyek>

npm install
# salin .env.example menjadi .env dan isi nilainya (lihat bagian .env)
npm run dev   # jika ada nodemon
# atau
node server.js
```

Server default pada `http://localhost:3000` (atau sesuai `PORT` di `.env`).

---

## Konfigurasi Lingkungan (.env)

Buat file `.env` di root:

```env
# Server
PORT=5000
MONGO_URI=mongodb+srv://ammaryasir839_db_user:enter123@paw-us3.8mnhnlt.mongodb.net/?retryWrites=true&w=majority&appName=PAW-US3
JWT_SECRET=secret123
MIDTRANS_SERVER_KEY=Mid-server-hDeH3WAp0vflUjMBWKoEUs6O
MIDTRANS_CLIENT_KEY=Mid-client-w_X9A1ro95HvkBki


# Midtrans
MIDTRANS_SERVER_KEY=Mid-server-hDeH3WAp0vflUjMBWKoEUs6O
MIDTRANS_CLIENT_KEY=Mid-client-w_X9A1ro95HvkBki

# OpenWeather
WEATHER_API_KEY=xxxxxxxxxxxxxxxxxxx
```

---

## Struktur Direktori

```text
config/
  db.js
controllers/
  authController.js
  messageController.js
  notificationController.js
  paymentController.js
  studentController.js
  weatherController.js
events/
  notifications.js
middleware/
  auth.js
  roles.js
models/
  Activity.js
  Attendance.js
  Message.js
  Notification.js
  Payment.js
  Student.js
  User.js
routes/
  activities.js
  attendance.js
  auth.js
  message.js
  notifications.js
  payments.js
  students.js
  weather.js
server.js (atau app.js)
```

---

## Model Data

* **User**

  * `username` (unik), `password` (bcrypt), `role`: `user|parent|admin`
* **Student**

  * `nik` (16 digit unik), `nama`, `tanggalLahir`, `alamat`, `golonganDarah`, `jenisKelamin`, `agama`, `NamaOrangtua`, `NoHPOrangtua`, `parentUserId`, `status`: `pending|active`
* **Payment**

  * `userId`, `studentNik`, `orderId` (unik), `amount`, `status`: `pending|settlement|failed|expire|cancel|deny`, `redirectUrl`
* **Notification**

  * `title`, `body`, `audience`: `all|parents|byUser`, `recipients` [userId], `createdBy`, `readBy` [userId], timestamps
* **Message**

  * `teacherId`(diimplementasikan sebagai admin), `parentId`, `studentId`, `content`, `createdAt`
* **Activity**

  * `day`, `activity`
* **Attendance**

  * `name`, `date`, `status`: `Hadir|Tidak Hadir|Izin`

---

## Autentikasi

* Gunakan header: `Authorization: Bearer <JWT>`
* Mendapatkan JWT dari `/api/auth/login`
* Middleware:

  * `auth` ➜ validasi token
  * `requireRole(...roles)` ➜ batasi akses berdasarkan role

---

## Endpoint API

> Base path diasumsikan: `/api`

### Auth

**POST** `/api/auth/register`

```json
{ "username": "budi", "password": "rahasia" }
```

**Respon**: `{ "message": "Akun dibuat, silakan login" }`

**POST** `/api/auth/login`

```json
{ "username": "budi", "password": "rahasia" }
```

**Respon**

```json
{ "token": "<jwt>", "username": "budi", "role": "user" }
```

---

### Students (pendaftaran siswa)

> Perlu `Authorization`.
> Role:
>
> * `POST /register` → `user|parent|admin`
> * `GET /my` dan `PATCH /:id` → `parent|admin`

**POST** `/api/students/register`

```json
{
  "nik": "3201010101010101",
  "nama": "Ani",
  "tanggalLahir": "2019-05-01",
  "alamat": "Jalan Melati No.1",
  "golonganDarah": "O",
  "jenisKelamin": "Perempuan",
  "agama": "Islam",
  "NamaOrangtua": "Siti",
  "NoHPOrangtua": "08123456789"
}
```

**Respon**: `{ "message": "Siswa terdaftar", "student": { ... } }`

**GET** `/api/students/my?showNik=1`

* `showNik=1` untuk tampilkan NIK utuh; default akan dimasking.

**PATCH** `/api/students/:id`

```json
{ "alamat": "Jalan Kenanga No. 2" }
```

---

### Payments (Midtrans)

> Perlu `Authorization`.
> Role: `user|parent|admin` (untuk checkout)

**POST** `/api/payments/checkout-nik`

```json
{ "nik": "3201010101010101" }
```

**Respon (contoh)**

```json
{
  "message": "Silakan lanjutkan pembayaran",
  "order_id": "PAUD-169...-abc123",
  "payment_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/...",
  "reused": false
}
```

**POST** `/api/payments/checkout-batch`

```json
{ "niks": ["3201010101010101", "3201010101010102"] }
```

**Respon**

```json
{
  "results": [
    { "nik": "3201010101010101", "ok": true, "order_id": "...", "payment_url": "...", "reused": false },
    { "nik": "3201010101010102", "ok": false, "error": "Siswa tidak ditemukan / bukan milik Anda" }
  ]
}
```

**POST** `/api/payments/callback`  *(dipanggil oleh Midtrans)*

* Otomatis update `Payment.status`. Jika `settlement`:

  * `Student.status` ➜ `active`
  * `User.role` (`user`) ➜ `parent`

> **Penting:** Set `MIDTRANS_VERIFY_SIG=true` & `MIDTRANS_SERVER_KEY` agar signature diverifikasi.

---

### Notifications

> Sebagian endpoint perlu `admin`.

**POST** `/api/notifications` *(admin)*

```json
{
  "title": "Pengumuman",
  "body": "Libur besok",
  "audience": "parents", // "all" | "parents" | "byUser"
  "recipients": []       // isi userId jika audience=byUser
}
```

**GET** `/api/notifications/my` *(user/parent/admin)*

* Mengambil notifikasi yang relevan untuk user saat ini.
* Field `isRead` sudah dihitung di server.

**PATCH** `/api/notifications/:id/read`

* Tandai sebagai sudah dibaca (idempotent).

**GET** `/api/notifications` *(admin)*

* Daftar semua notifikasi (populate pembuat & penerima).

**GET** `/api/notifications/stream` *(SSE; butuh Bearer token)*

* Aliran event realtime. Lihat bagian [SSE](#notifikasi-realtime-sse).

---

### Messages

> `admin` dapat **kirim**; `parent` dapat **baca** inbox.

**POST** `/api/messages/send` *(admin)*

```json
{
  "parentId": "<userId_orangtua>",
  "studentId": "<studentId>",
  "content": "Anak Anda teladan minggu ini 👏"
}
```

**GET** `/api/messages/inbox` *(parent)*

* Mengembalikan pesan yang ditujukan ke orangtua tersebut.
* `teacherId` dipopulate ke `username`, `studentId` ke `nama`.

---

### Weather

**GET** `/api/weather?city=Bandung`
**Respon**

```json
{ "kota": "Bandung", "suhu": "25°C", "kondisi": "berawan" }
```

---

### Activities

**GET** `/api/activities`
**POST** `/api/activities`

```json
{ "day": "Senin", "activity": "Menggambar" }
```

### Attendance

**GET** `/api/attendance`
**POST** `/api/attendance`

```json
{ "name": "Budi", "date": "2025-09-01", "status": "Hadir" }
```

---

## Notifikasi Realtime (SSE)

**Client contoh (browser/FE)**

```html
<script>
  const token = '<JWT>';
  const es = new EventSource('/api/notifications/stream', {
    withCredentials: false
  });
  // Tambahkan token via query atau gunakan proxy yang menambahkan header Authorization
  // Alternatif: gunakan fetch untuk mendapatkan URL yang sudah signed, dsb.

  es.addEventListener('message', (e) => {
    const payload = JSON.parse(e.data);
    // { type: 'notification:new', data: { _id,title,body,audience,recipients,createdAt } }
    console.log('notif', payload);
  });

  es.addEventListener('ping', () => {
    // keep-alive
  });
</script>
```

> SSE endpoint akan memfilter sesuai role dan userId. Event `notification:new` dikirim saat admin membuat notifikasi.

---

## Menyiapkan Admin

Jika belum ada admin, buat manual di MongoDB.

**Opsi cepat via Node script (gunakan bcrypt 10 salt rounds):**

```js
// scripts/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const hash = await bcrypt.hash('admin123', 10);
  const u = await User.create({ username: 'admin', password: hash, role: 'admin' });
  console.log('Admin created:', u.username);
  process.exit(0);
})();
```

Jalankan:

```bash
node -r dotenv/config scripts/createAdmin.js
```

---

## Tips Keamanan & Produksi

* Simpan **JWT_SECRET** dan **MIDTRANS_SERVER_KEY** di secret manager (bukan git).
* Aktifkan **HTTPS** di server/reverse proxy.
* Set **CORS** jika frontend beda origin.
* Validasi kepemilikan `studentId` ↔ `parentId` saat kirim pesan (opsional tapi disarankan).
* Aktifkan `MIDTRANS_VERIFY_SIG=true` di production.
* Gunakan **rate limiting** & **helmet** untuk hardening.

---

## Troubleshooting

* **Cannot connect to Mongo** → cek `MONGO_URI` dan mongod berjalan.
* **401 Token tidak valid** → pastikan header `Authorization: Bearer <token>` benar.
* **Payment tidak update** → cek hit **/api/payments/callback** (expose publik), periksa log signature.
* **SSE tidak nyambung** → pastikan tidak ada proxy yang mem-buffer respons, dan kirim token sesuai arsitektur Anda.

---

## Lisensi

Bebas digunakan untuk pembelajaran/internal. Tambahkan lisensi sesuai kebutuhan proyek Anda.

---

Selamat mencoba! Kalau mau, aku bisa buatkan **koleksi Postman** dan **env template** siap pakai agar QA lebih cepat.


## Catatan

- Simpan file `.env` di `.gitignore` agar tidak bocor ke GitHub.

