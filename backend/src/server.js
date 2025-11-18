// src/server.js
require("dotenv").config();
require("./config/passport");

const path = require("path");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");

const app = express();

// =======================
// 1. KONEKSI DATABASE
// =======================
connectDB();

// =======================
// 2. CORS: BOLEH KE SEMUA
// =======================

// kasih header CORS ke semua request (GET, POST, OPTIONS, dll)
app.use(cors());

// khusus OPTIONS (preflight), balas 204 supaya browser puas
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // No Content
  }
  next();
});

// =======================
// 3. BODY PARSER & LAINNYA
// =======================
app.set("trust proxy", true);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

// kalau tidak pakai upload, baris ini boleh dihapus
// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// =======================
// 4. ROUTES
// =======================
app.use("/api/auth",         require("./routes/auth"));
app.use("/api/student",      require("./routes/student"));
app.use("/api/teacher",      require("./routes/teacher"));
app.use("/api/payment",      require("./routes/payment"));
app.use("/api/activities",   require("./routes/activities"));
app.use("/api/attendance",   require("./routes/attendance"));
app.use("/api/message",      require("./routes/messages"));
app.use("/api/notification", require("./routes/notification"));
app.use("/api/weather",      require("./routes/weather"));
app.use("/api/feedback",     require("./routes/feedback"));
app.use("/api/admin",        require("./routes/admin"));

app.get("/api/healthz", (req, res) => res.send("OK"));

// =======================
// 5. ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  console.error("ERROR MIDDLEWARE:", err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Not Found" }));

// =======================
// 6. EXPORT UNTUK VERCEL
// =======================
// JANGAN pakai app.listen di sini
module.exports = app;
