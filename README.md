# 🧩 Express.js + MongoDB Auth Boilerplate


---

## ⚙️ Fitur

- Login untuk **admin & user**
- Struktur folder terpisah: models, routes, controllers, middleware
- JWT Authentication
- Enkripsi password pakai bcrypt
- Siap dikembangkan untuk register berbayar via QRIS

---

## 📂 Struktur Folder

=======
# 📚 PAUD Registration App - Cara Pakai
Aplikasi web untuk **pendaftaran anak PAUD secara online**.

---

## 🚀 Persiapan

1. **Installasi**
    - Pastikan sudah menginstall:
      - [Node.js](https://nodejs.org/)
      - [npm](https://www.npmjs.com/)
      - (Opsional) [nodemon](https://nodemon.io/) untuk auto-reload

2. **Clone Repository**
    ```bash
    git clone https://github.com/AMMAR839/Pengembangan-Aplikasi-Web_US-3.git
    cd Pengembangan-Aplikasi-Web_US-3
    ```

3. **Install Dependencies**
    ```bash
    npm install
    ```

4. **Konfigurasi Environment**
    - Buat file `.env` di root project dengan isi:
      ```
      
      PORT=5000
      MONGO_URI=mongodb+srv://ammaryasir839_db_user:enter123@paw-us3.8mnhnlt.mongodb.net/?retryWrites=true&w=majority&appName=PAW-US3
      JWT_SECRET=secret123
      MIDTRANS_SERVER_KEY=Mid-server-hDeH3WAp0vflUjMBWKoEUs6O
      MIDTRANS_CLIENT_KEY=Mid-client-w_X9A1ro95HvkBki

      ```

---

## 🖥️ Menjalankan Server

- Jalankan server dengan:
  ```bash
  npm start
  ```
- Atau menggunakan nodemon:
  ```bash
  nodemon server.js
  ```

- Server berjalan di: [http://localhost:5000](http://localhost:5000)

---

## 📋 Cara Menggunakan Aplikasi

### 👨‍👩‍👧‍👦 Untuk Orang Tua
1. **Register akun** (role otomatis: user)
2. **Login** dan dapatkan token JWT
3. **Daftarkan anak** dengan data lengkap (nama, TTL, alamat, kontak darurat)
4. **Bayar pendaftaran** via QRIS Midtrans (Rp. 25.000 per anak)
5. **Monitor kegiatan harian** anak melalui notifikasi
6. **Terima peringatan cuaca** dan notifikasi acara TK

### 👩‍🏫 Untuk Guru
1. **Login** dengan akun guru (role: teacher)
2. **Kelola kelas** dan siswa yang diajar
3. **Catat absensi harian** (check-in/check-out)
4. **Dokumentasi kegiatan** dengan foto dan catatan
5. **Kirim notifikasi** ke orang tua tentang aktivitas anak
6. **Buat peringatan cuaca** saat kondisi tidak mendukung

### 👑 Untuk Admin TK
1. **Login** dengan akun admin (role: admin)
2. **Kelola seluruh data** siswa dan status pembayaran
3. **Buat jadwal kegiatan** dan acara TK
4. **Monitor sistem** dan laporan komprehensif
5. **Atur pertemuan orang tua** triwulanan dan acara tahunan

---

---

## 📊 Database Schema (ERD)

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

---

## ⚠️ Catatan

- Simpan file `.env` di `.gitignore` agar tidak bocor ke GitHub.
- Gunakan browser atau tool API (seperti Postman / Thunder Client) untuk testing API.
- JWT token dikirim di header `Authorization: Bearer <token>` untuk route yang memerlukan login.

