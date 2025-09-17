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

### a. User
- **Register akun** (role otomatis: user)
- **Login** (mendapatkan token JWT)
- **Tambah data anak** (isi nama, TTL, dll.)
- **Bayar pendaftaran** via QRIS (setiap anak punya pembayaran sendiri)

### b. Admin
- **Buat akun admin** secara manual di database MongoDB (role: admin)
- **Login** sebagai admin
- **Melihat seluruh data anak dan status pembayaran**

---

## ⚠️ Catatan

- Simpan file `.env` di `.gitignore` agar tidak bocor ke GitHub.
- Gunakan browser atau tool API (seperti Postman / Thunder Client) untuk testing API.
- JWT token dikirim di header `Authorization: Bearer <token>` untuk route yang memerlukan login.
