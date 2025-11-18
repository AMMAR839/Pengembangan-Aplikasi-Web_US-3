"use client";

import "./dokumentasi-kbm.css";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { NotificationList } from "@/app/components/NotificationList";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DokumentasiKBMPage() {
  const router = useRouter();

  const [activeNav, setActiveNav] = useState("dokumentasi");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [documentationData, setDocumentationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDocumentation();

    // Setup Socket.IO untuk real-time update
    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    // Listen untuk photo upload event
    socket.on('photo_uploaded', (data) => {
      console.log('New photo uploaded:', data);
      fetchDocumentation(); // Refresh dokumentasi ketika ada upload baru
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  async function fetchDocumentation() {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch(`${API_URL}/api/gallery`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error("Failed to fetch documentation");

      const data = await res.json();

      const formatted = data.map((doc) => ({
        id: doc._id,
        date: new Date(doc.postedAt || doc.createdAt).toLocaleDateString(
          "id-ID",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        ),
        photo: doc.imageUrl || "/images/dokumentasidummy1.png",
        notes: doc.caption || "",
      }));

      setDocumentationData(formatted);
      setError("");
    } catch (err) {
      console.error("Error fetching documentation:", err);
      setError("Tidak dapat memuat dokumentasi");

      // fallback dummy data
      setDocumentationData([
        {
          id: 1,
          date: "Senin, 28 Agustus 2025",
          photo: "/images/dokumentasidummy1.png",
          notes: "",
        },
        {
          id: 2,
          date: "Rabu, 23 Agustus 2025",
          photo: "/images/dokumentasidummy1.png",
          notes: "",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
    }
    router.replace("/");
  }

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
              <span className="nav-label">Dashboard</span>
            </a>

            <a
              href="/wali-murid/jadwal"
              className={`nav-item ${activeNav === "jadwal" ? "active" : ""}`}
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
              <span className="nav-label">Jadwal</span>
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
              <span className="nav-label">Dokumentasi KBM</span>
            </a>

            <a
              href="/wali-murid/profil-anak"
              className={`nav-item ${activeNav === "profil" ? "active" : ""}`}
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
              <span className="nav-label">Profil Anak</span>
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

        {loading && (
          <p style={{ textAlign: "center", padding: "20px" }}>
            Memuat dokumentasi...
          </p>
        )}

        {error && (
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

        {!loading && documentationData.length === 0 && !error && (
          <p style={{ textAlign: "center", padding: "20px" }}>
            Belum ada dokumentasi tersedia
          </p>
        )}

        {!loading && documentationData.length > 0 && (
          <div className="dokumentasi-container">
            <div className="dokumentasi-grid">
              {/* Kolom Tanggal */}
              <div className="dokumentasi-column">
                <div className="dokumentasi-column-header">Tanggal</div>
                <div className="dokumentasi-column-content">
                  {documentationData.map((item) => (
                    <div key={item.id} className="dokumentasi-date-card">
                      {item.date}
                    </div>
                  ))}
                </div>
              </div>

              {/* Kolom Foto Kegiatan */}
              <div className="dokumentasi-column">
                <div className="dokumentasi-column-header">Foto Kegiatan</div>
                <div className="dokumentasi-column-content">
                  {documentationData.map((item) => (
                    <div key={item.id} className="dokumentasi-photo-card">
                      <img
                        src={item.photo}
                        alt={`Dokumentasi ${item.date}`}
                        className="dokumentasi-photo"
                      />
                    </div>
                  ))}
                  <div className="dokumentasi-pagination">•••••</div>
                </div>
              </div>

              {/* Kolom Catatan */}
              <div className="dokumentasi-column">
                <div className="dokumentasi-column-header">Catatan</div>
                <div className="dokumentasi-column-content">
                  {documentationData.map((item) => (
                    <div key={item.id} className="dokumentasi-notes-card">
                      {item.notes || "-"}
                    </div>
                  ))}
                </div>
              </div>
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
