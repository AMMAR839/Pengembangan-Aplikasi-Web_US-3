"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PendaftaranAnakPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [alamat, setAlamat] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [namaOrangTua, setNamaOrangTua] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ==== WAJIB LOGIN ====
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("redirectAfterLogin", "/pendaftaran-anak");
      router.replace("/");
    }
  }, [router]);

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
    }
    router.replace("/");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const res = await fetch(`${API_URL}/api/student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          firstName,
          lastName,
          alamat,
          tanggalLahir,
          jenisKelamin,
          parentName: namaOrangTua,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal mendaftarkan anak");
        return;
      }

      setSuccess("Data anak berhasil didaftarkan");
      setFirstName("");
      setLastName("");
      setAlamat("");
      setTanggalLahir("");
      setJenisKelamin("");
      setNamaOrangTua("");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="umum-page">
      {/* ===== NAVBAR ===== */}
      <header className="umum-nav">
        <div className="umum-nav-left">
          <div className="umum-logo">
            <span className="umum-logo-flower">🌼</span>
            <span className="umum-logo-text">Little Garden</span>
          </div>

          <nav className="umum-nav-links">
            <Link href="Dashboard/umum#beranda" className="nav-item">
              Beranda
            </Link>
            <Link href="Dashboard/umum#tentang-kami" className="nav-item">
              Tentang Kami
            </Link>
            <Link href="Dashboard/umum#kurikulum" className="nav-item">
              Kurikulum
            </Link>

            {/* Halaman ini yang aktif */}
            <span className="nav-item active">Pendaftaran Anak</span>
          </nav>
        </div>

        <div className="umum-nav-right">
          <button className="umum-icon-btn" type="button">
            🔔
          </button>
          <button
            className="umum-icon-btn"
            type="button"
            onClick={handleLogout}
            title="Logout"
          >
            ⏻
          </button>
        </div>
      </header>

      {/* ===== FORM PENDAFTARAN ANAK ===== */}
      <main className="daftar-page">
        <section className="daftar-card">
          <div className="daftar-left">
            <h2 className="daftar-title">Pendaftaran Anak</h2>

            <form className="daftar-form" onSubmit={handleSubmit}>
              <div className="daftar-row">
                <div className="daftar-field">
                  <label>Nama Depan</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="daftar-field">
                  <label>Nama Belakang</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="daftar-field">
                <label>Alamat</label>
                <input
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  required
                />
              </div>

              <div className="daftar-row">
                <div className="daftar-field">
                  <label>Tanggal Lahir</label>
                  <input
                    type="date"
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    required
                  />
                </div>
                <div className="daftar-field">
                  <label>Jenis Kelamin</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value)}
                    required
                  >
                    <option value="">Pilih...</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="daftar-field">
                <label>Nama Orang Tua</label>
                <input
                  value={namaOrangTua}
                  onChange={(e) => setNamaOrangTua(e.target.value)}
                  required
                />
              </div>

              {error && <p className="auth-error">{error}</p>}
              {success && <p className="daftar-success">{success}</p>}

              <button
                type="submit"
                className="daftar-submit-btn"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Kirim Pendaftaran"}
              </button>
            </form>
          </div>

          <div className="daftar-right">
            <div className="daftar-bg-shape" />
            <img
              src="/umum-kid.jpg"
              alt="Anak Little Garden"
              className="daftar-image"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
