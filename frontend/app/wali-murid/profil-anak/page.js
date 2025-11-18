"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import  "./ProfilAnak.module.css"; //

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProfilAnakPage() {
  const router = useRouter();

  const [activeNav, setActiveNav] = useState("profil");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Ambil data anak milik wali murid yang login
  useEffect(() => {
    async function fetchChildren() {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;
        const role =
          typeof window !== "undefined"
            ? localStorage.getItem("role")
            : null;

        // Belum login → lempar ke login
        if (!token) {
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "redirectAfterLogin",
              "/wali-murid/profil-anak"
            );
          }
          router.replace("/");
          return;
        }

        // Batasi hanya parent / admin
        if (role !== "parent" && role !== "admin") {
          setError("Halaman ini hanya untuk wali murid / admin.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/student/my?showNik=1`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Gagal memuat data anak.");
          setChildren([]);
        } else {
          setChildren(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
        setError("Terjadi kesalahan saat memuat data anak.");
      } finally {
        setLoading(false);
      }
    }

    fetchChildren();
  }, [router]);

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
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

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
      {/* ========== SIDEBAR (PAKAI KELAS GLOBAL) ========== */}
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
                src="/images/profil.png"
                alt="Profil / Logout"
                width={30}
                height={40}
                className="umum-logo-image"
                style={{ height: "auto" }}
              />
            </div>
          </button>
        </div>
      </aside>

      {/* ========== KONTEN PROFIL ANAK ========== */}
      <div className="wali-sub-page">
        <div className="profil-header">
          <h1 className="wali-sub-page-title">Profil Anak</h1>
        </div>

        {loading && <p style={{ textAlign: "center" }}>Memuat data anak...</p>}

        {error && (
          <p
            style={{
              textAlign: "center",
              color: "#b91c1c",
              marginBottom: 16,
            }}
          >
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="profil-container">
              {children.length === 0 ? (
                <p style={{ textAlign: "center" }}>
                  Belum ada data anak terdaftar.
                </p>
              ) : (
                children.map((child) => (
                  <div key={child._id} className="profil-card">
                    {/* FOTO ANAK */}
                    <div className="profil-photo-section">
                      <img
                        src={
                          child.photoUrl ||
                          "/child-photo.jpg" // fallback kalau belum ada foto
                        }
                        alt={child.nama}
                        className="profil-photo"
                      />
                    </div>

                    {/* DATA ANAK */}
                    <div className="profil-data-section">
                      <div className="profil-field">
                        <label className="profil-label">Nama</label>
                        <div className="profil-value">{child.nama}</div>
                      </div>

                      <div className="profil-field">
                        <label className="profil-label">
                          Tanggal Lahir
                        </label>
                        <div className="profil-value">
                          {child.tanggalLahir
                            ? new Date(
                                child.tanggalLahir
                              ).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })
                            : "-"}
                        </div>
                      </div>

                      <div className="profil-field">
                        <label className="profil-label">Alamat</label>
                        <div className="profil-value">
                          {child.alamat || "-"}
                        </div>
                      </div>

                      <div className="profil-field">
                        <label className="profil-label">
                          Golongan Darah
                        </label>
                        <div className="profil-value">
                          {child.golonganDarah || "-"}
                        </div>
                      </div>

                      <div className="profil-field">
                        <label className="profil-label">
                          Jenis Kelamin
                        </label>
                        <div className="profil-value">
                          {child.jenisKelamin || "-"}
                        </div>
                      </div>

                      <div className="profil-field">
                        <label className="profil-label">Agama</label>
                        <div className="profil-value">
                          {child.agama || "-"}
                        </div>
                      </div>

                      <div className="profil-field">
                        <label className="profil-label">Status</label>
                        <div className="profil-value">
                          {child.status === "active"
                            ? "Aktif"
                            : child.status === "pending"
                            ? "Menunggu Konfirmasi"
                            : child.status || "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="profil-change-note">
              Ingin melakukan perubahan? Hubungi admin sekolah
              <a
                href="#"
                style={{
                  marginLeft: "4px",
                  color: "#052826",
                  textDecoration: "underline",
                }}
              >
                disini
              </a>
              .
            </div>
          </>
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
