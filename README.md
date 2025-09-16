project: "PAUD Registration App"
description: >
  Aplikasi web untuk pendaftaran anak PAUD secara online.
  Menggunakan Express.js dan MongoDB Atlas dengan login berbasis JWT.
  User dapat mendaftarkan akun, menambahkan data anak, dan melakukan pembayaran QRIS.
  Admin dapat melihat semua data yang masuk.

technologies:
  - "Node.js / Express.js (backend)"
  - "MongoDB Atlas (database cloud)"
  - "Mongoose (ODM MongoDB)"
  - "JSON Web Token (JWT) (autentikasi)"
  - "dotenv (konfigurasi rahasia)"
  - "midtrans-client (opsional: untuk QRIS)"

structure:
  - name: models
    description: "Skema User & Student (otomatis membuat collection users dan students)"
  - name: routes
    description: "Route auth (register/login), student (daftar anak), payment (callback)"
  - name: middleware
    description: "Middleware auth untuk memverifikasi JWT"
  - name: controllers
    description: "Logika bisnis: authController, studentController, paymentController"
  - name: config
    description: "config/db.js untuk koneksi MongoDB"
  - name: server.js
    description: "Entry point utama aplikasi"
  - name: .env
    description: "Variabel lingkungan (MONGO_URI, JWT_SECRET, PORT)"

env_config:
  MONGO_URI: "mongodb+srv://ammaryasir839_db_user:enter123@paw-us3.8mnhnlt.mongodb.net/paud?retryWrites=true&w=majority&appName=PAW-US3"
  JWT_SECRET: "rahasia_super_aman"
  PORT: "5000"

setup_steps:
  - "git clone <repo-url>"
  - "cd project-folder"
  - "npm install"
  - "Buat file .env sesuai env_config di atas"
  - "npm start  (atau nodemon server.js untuk auto-reload)"

roles:
  user:
    - "register akun (otomatis role: user)"
    - "login (mendapat JWT)"
    - "tambah data anak (student)"
    - "membayar pendaftaran via QRIS (setiap anak punya payment sendiri)"
  admin:
    - "dibuat manual di database (role: admin)"
    - "login"
    - "melihat seluruh data students & payments"

flow:
  - "User register akun (tersimpan di collection users)"
  - "User login → server mengembalikan JWT"
  - "User menambahkan data anak → student dibuat dengan status pending"
  - "Server membuat payment record & order ke gateway (QRIS)"
  - "User bayar via QRIS"
  - "Gateway memanggil /api/payment/callback → update payment.status = settlement"
  - "Jika settlement → student.status = active"
  - "Admin dapat melihat data lengkap"

access_url: "http://localhost:5000"

notes:
  - "Pastikan .env tidak di-commit ke GitHub (.gitignore)"
  - "Gunakan MongoDB Atlas untuk akses online (gantikan MONGO_URI sesuai cluster-mu)"
  - "Verifikasi webhook (signature) dari Midtrans di production"
  - "Gunakan HTTPS dan simpan secrets di secret manager untuk production"

license: "Untuk pembelajaran / pengembangan pribadi"

# full_readme berisi versi README lengkap (markdown). 
# Jika mau README.md, copy isi block ini dan simpan sebagai README.md
full_readme: |
  # 📚 PAUD Registration App

  Aplikasi web untuk **pendaftaran anak PAUD secara online** menggunakan:

  - ⚙️ Express.js + MongoDB Atlas
  - 🔐 Login JWT (user & admin)
  - 🧒 Pendaftaran data anak
  - 💳 Pembayaran via QRIS

  ---

  ## ⚙️ Teknologi

  - Node.js / Express.js — backend server
  - MongoDB Atlas — database cloud
  - Mongoose — ODM MongoDB
  - JSON Web Token (JWT) — autentikasi login
  - dotenv — konfigurasi rahasia

  ---

  ## 🗂️ Struktur Project


