"use client";

import "./dokumentasi-kbm.css";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { io } from "socket.io-client";
import { NotificationList } from "@/app/components/NotificationList";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DokumentasiKBMPage() {
  const router = useRouter();

  const [activeNav, setActiveNav] = useState("dokumentasi");

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [dailyInfo, setDailyInfo] = useState(null);
  const [slots, setSlots] = useState([]);

  const [nowInfo, setNowInfo] = useState(null); // info "sekarang lagi ngapain"

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // ===== Ambil jadwal + foto harian berdasarkan siswa =====
  async function fetchDailyDocs(studentId) {
    try {
      if (!studentId) {
        setDailyInfo(null);
        setSlots([]);
        return;
      }

      setLoading(true);
      setError("");

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        setError("Sesi login berakhir. Silakan login ulang.");
        router.replace("/login");
        return;
      }

      const res = await fetch(
        `${API_URL}/api/activities/daily-by-student?studentId=${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal memuat dokumentasi KBM hari ini.");
        setDailyInfo(null);
        setSlots([]);
        return;
      }

      const dateLabel = data.date
        ? new Date(data.date).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "";

      setDailyInfo({
        studentName: data.student?.nama,
        className: data.className || data.student?.kelas,
        dateLabel,
        rawDate: data.date,
        message: data.message || "",
      });

      const sortedSlots = (data.slots || [])
        .slice()
        .sort((a, b) => (a.start || "").localeCompare(b.start || ""));

      setSlots(sortedSlots);
    } catch (err) {
      console.error("fetchDailyDocs error:", err);
      setError("Terjadi kesalahan saat memuat dokumentasi KBM.");
      setDailyInfo(null);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }

  // ===== Info "anak saya lagi ngapain sekarang?" =====
  async function fetchCurrentActivity(studentId) {
    try {
      if (!studentId) {
        setNowInfo(null);
        return;
      }

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        setNowInfo(null);
        return;
      }

      const res = await fetch(
        `${API_URL}/api/activities/current?studentId=${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setNowInfo(null);
        return;
      }

      const now = data.now ? new Date(data.now) : null;

      const timeLabel = now
        ? now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

      setNowInfo({
        timeLabel,
        activity: data.activity || null,
        next: data.next || null,
        message: data.message || "",
      });
    } catch (err) {
      console.error("fetchCurrentActivity error:", err);
      setNowInfo(null);
    }
  }

  // ===== INIT: cek login + load daftar anak =====
  useEffect(() => {
    async function init() {
      try {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token) {
          localStorage.setItem(
            "redirectAfterLogin",
            "/wali-murid/dokumentasi-kbm"
          );
          router.replace("/login");
          return;
        }

        if (role !== "parent" && role !== "admin") {
          setError("Halaman ini hanya untuk wali murid / admin.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/student/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Gagal memuat data anak.");
          setStudents([]);
          setLoading(false);
          return;
        }

        const arr = Array.isArray(data) ? data : [];
        setStudents(arr);

        if (arr.length > 0) {
          const firstId = arr[0]._id;
          setSelectedStudentId(firstId);
          await fetchDailyDocs(firstId);
          await fetchCurrentActivity(firstId);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("init dokumentasi-kbm error:", err);
        setError("Terjadi kesalahan saat memuat halaman.");
        setLoading(false);
      }
    }

    init();
  }, [router]);

  // ===== Saat ganti anak di dropdown =====
  async function handleChangeStudent(id) {
    setSelectedStudentId(id);
    if (id) {
      await fetchDailyDocs(id);
      await fetchCurrentActivity(id);
    } else {
      setDailyInfo(null);
      setSlots([]);
      setNowInfo(null);
    }
  }

  // ===== Logout =====
  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
    }
    router.replace("/login");
  }

  // ===== Feedback =====
  function handleSubmitFeedback() {
    if (feedback.trim()) {
      submitFeedbackToAPI(feedback.trim());
    }
  }

  async function submitFeedbackToAPI(feedbackText) {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        console.error("No token found");
        setFeedbackSubmitted(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback: feedbackText }),
      });

      if (!res.ok) throw new Error("Gagal mengirim feedback");

      setFeedbackSubmitted(true);
      setTimeout(() => {
        setFeedback("");
        setFeedbackSubmitted(false);
        setShowFeedbackModal(false);
      }, 2000);
    } catch (err) {
      console.error("Feedback API error:", err);
      setFeedback("");
      setShowFeedbackModal(false);
    }
  }

  // ===== Render =====
  return (
    <div className={`umum-page ${showFeedbackModal ? "blur-bg" : ""}`}>
      {/* Notifikasi (bell) */}
      <NotificationList />

      {/* ========== SIDEBAR ========== */}
      <aside className="umum-nav sidebar-layout">
        {/* LOGO ATAS */}
        <div className="umum-logo sidebar-logo">
          <Image
            src="/images/logo.png"
            alt="Little Garden Logo"
            width={70}
            height={40}
            className="umum-logo-image"
            style={{ height: "auto" }}
          />
        </div>

        {/* MENU ICON */}
        <div className="umum-nav-left sidebar-content">
          <nav className="umum-nav-links sidebar-links">
            <a
              href="/wali-murid/dashboard"
              className={`nav-item ${
                activeNav === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActiveNav("dashboard")}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/dashboard.png"
                  alt="Dashboard"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: "auto" }}
                />
              </div>
            </a>

            <a
              href="/wali-murid/jadwal"
              className={`nav-item ${
                activeNav === "jadwal" ? "active" : ""
              }`}
              onClick={() => setActiveNav("jadwal")}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/jadwal.png"
                  alt="Jadwal"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: "auto" }}
                />
              </div>
            </a>

            <a
              href="/wali-murid/dokumentasi-kbm"
              className={`nav-item ${
                activeNav === "dokumentasi" ? "active" : ""
              }`}
              onClick={() => setActiveNav("dokumentasi")}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/dokumentasikbm.png"
                  alt="Dokumentasi KBM"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: "auto" }}
                />
              </div>
            </a>

            <a
              href="/wali-murid/profil-anak"
              className={`nav-item ${
                activeNav === "profil" ? "active" : ""
              }`}
              onClick={() => setActiveNav("profil")}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/profilanak.png"
                  alt="Profil Anak"
                  width={25}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: "auto" }}
                />
              </div>
            </a>
          </nav>
        </div>

        {/* BOTTOM ICONS (LOGOUT) */}
        <div className="umum-nav-right sidebar-actions">
          <button
            className="umum-icon-btn"
            type="button"
            onClick={handleLogout}
            title="Logout"
          >
            <div className="umum-logo sidebar-logo">
              <Image
                src="/images/logout.png"
                alt="Logout"
                width={30}
                height={40}
                className="umum-logo-image"
                style={{ height: "auto" }}
              />
            </div>
          </button>
        </div>
      </aside>

      {/* ========== KONTEN DOKUMENTASI KBM ========== */}
      <div className="wali-sub-page">
        <div className="dokumentasi-header">
          <h1 className="wali-sub-page-title">Dokumentasi KBM</h1>
        </div>

        {/* Toolbar: pilih anak + info hari ini */}
        <div className="dokumentasi-toolbar">
          <div className="toolbar-left">
            <label className="toolbar-label">Pilih Anak</label>
            <select
              className="toolbar-select"
              value={selectedStudentId}
              onChange={(e) => handleChangeStudent(e.target.value)}
              disabled={students.length === 0}
            >
              {students.length === 0 && (
                <option value="">Tidak ada anak terdaftar</option>
              )}
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.nama} {s.kelas ? `- Kelas ${s.kelas}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="toolbar-right">
            {dailyInfo && (
              <>
                <div className="today-badge">
                  {dailyInfo.dateLabel || "Hari ini"}
                </div>
                <div className="class-badge">
                  {dailyInfo.className
                    ? `Kelas ${dailyInfo.className}`
                    : "Kelas -"}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Panel "Sekarang lagi apa" */}
        {nowInfo && (
          <div className="kbm-now-card">
            <div className="kbm-now-title">
              Sekarang ({nowInfo.timeLabel || "waktu server"}):
            </div>

            {nowInfo.message && (
              <div className="kbm-now-message">{nowInfo.message}</div>
            )}

            {!nowInfo.message && !nowInfo.activity && (
              <div className="kbm-now-text">
                Anak saat ini tidak berada pada slot kegiatan terjadwal.
              </div>
            )}

            {nowInfo.activity && (
              <div className="kbm-now-text">
                Sedang:{" "}
                <strong>
                  {nowInfo.activity.title} ({nowInfo.activity.start} -{" "}
                  {nowInfo.activity.end})
                </strong>
              </div>
            )}

            {nowInfo.next && (
              <div className="kbm-now-text">
                Setelah ini:{" "}
                <strong>
                  {nowInfo.next.title} ({nowInfo.next.start} -{" "}
                  {nowInfo.next.end})
                </strong>
              </div>
            )}
          </div>
        )}

        {/* State: Loading / Error / Tidak ada jadwal */}
        {loading && (
          <p style={{ textAlign: "center", padding: "20px" }}>
            Memuat dokumentasi...
          </p>
        )}

        {error && !loading && (
          <p
            style={{
              textAlign: "center",
              color: "#e74c3c",
              padding: "0 20px 20px",
            }}
          >
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          dailyInfo &&
          slots.length === 0 &&
          dailyInfo.message && (
            <p style={{ textAlign: "center", padding: "20px" }}>
              {dailyInfo.message}
            </p>
          )}

        {/* TABEL 3 KOLOM PER BARIS: Jadwal | Foto | Catatan */}
        {!loading && !error && slots.length > 0 && (
          <div className="kbm-wrapper">
            <div className="kbm-table">
              {/* HEADER */}
              <div className="kbm-header-row">
                <div className="kbm-header-cell">Jadwal Hari Ini</div>
                <div className="kbm-header-cell">Foto Kegiatan</div>
                <div className="kbm-header-cell">Catatan</div>
              </div>

              {/* ROW PER SLOT */}
              {slots.map((slot) => {
                const captions = (slot.photos || [])
                  .map((p) => p.caption)
                  .filter(Boolean);

                const noteText =
                  slot.note ||
                  (captions.length > 0 ? captions.join(" · ") : "-");

                const mainPhoto = slot.photos && slot.photos[0];
                const extraCount =
                  (slot.photos?.length || 0) > 1
                    ? slot.photos.length - 1
                    : 0;

                return (
                  <div className="kbm-row" key={slot._id}>
                    {/* Kolom 1: Jadwal */}
                    <div className="kbm-cell kbm-cell-schedule">
                      <div className="kbm-slot-time">
                        {slot.start} - {slot.end}
                      </div>
                      <div className="kbm-slot-title">{slot.title}</div>
                      {slot.note && (
                        <div className="kbm-slot-note-small">
                          {slot.note}
                        </div>
                      )}
                    </div>

                    {/* Kolom 2: Foto */}
                    <div className="kbm-cell kbm-cell-photo">
                      {mainPhoto ? (
                        <>
                          <div className="kbm-photo-wrapper kbm-photo-wrapper-large">
                            <img
                              src={mainPhoto.url}
                              alt={`Foto kegiatan - ${slot.title}`}
                              className="kbm-photo-img"
                            />
                          </div>
                          {extraCount > 0 && (
                            <div className="kbm-photo-extra-info">
                              +{extraCount} foto lain di slot ini
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="kbm-photo-empty">
                          Belum ada foto untuk kegiatan ini.
                        </div>
                      )}
                    </div>

                    {/* Kolom 3: Catatan */}
                    <div className="kbm-cell kbm-cell-notes">
                      <div className="kbm-note-text">{noteText}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FEEDBACK BAR */}
        <div className="feedback-bar">
          Punya masukan, kritik terkait sekolah, program, atau guru kami? Isi
          form masukan
          <button
            onClick={() => setShowFeedbackModal(true)}
            style={{
              marginLeft: "4px",
              color: "#052826",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            disini
          </button>
        </div>

        {/* FEEDBACK MODAL */}
        {showFeedbackModal && (
          <div className="feedback-modal-overlay">
            <div className="feedback-modal">
              <button
                className="feedback-modal-close"
                onClick={() => setShowFeedbackModal(false)}
                type="button"
              >
                ✕
              </button>

              <h2 className="feedback-modal-title">
                Form Pengisisan Kritik/Saran
              </h2>

              <textarea
                className="feedback-textarea"
                placeholder="Ketikkan saran anda disini...."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={feedbackSubmitted}
              />

              <button
                className={`feedback-submit-btn ${
                  feedbackSubmitted ? "success" : ""
                }`}
                onClick={handleSubmitFeedback}
                type="button"
                disabled={feedbackSubmitted}
              >
                {feedbackSubmitted ? "✓ Terkirim!" : "Kirimkan Saran!"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
