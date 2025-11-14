"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UmumDashboard() {
  const router = useRouter();

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
    }
    router.replace("/");
  }

  function handleDaftarAnak() {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      // belum login → simpan redirect, lalu ke halaman login
      localStorage.setItem("redirectAfterLogin", "/pendaftaran-anak");
      router.push("/");
    } else {
      // sudah login → langsung ke form
      router.push("/pendaftaran-anak");
    }
  }

  return (
    <div className="umum-page">
      {/* NAVBAR */}
      <header className="umum-nav">
        <div className="umum-nav-left">
          <div className="umum-logo">
            <span className="umum-logo-flower">🌼</span>
            <span className="umum-logo-text">Little Garden</span>
          </div>

          <nav className="umum-nav-links">
            <a href="#beranda">Beranda</a>
            <a href="#tentang-kami">Tentang Kami</a>
            <a href="#kurikulum">Kurikulum</a>
            {/* tombol, bukan Link langsung */}
            <button className="auth-link" type="button" onClick={handleDaftarAnak}>
              Pendaftaran Anak
            </button>
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

      {/* HERO */}
      <main className="umum-hero" id="beranda">
        <section className="umum-hero-left">
          <p className="umum-eyebrow">Di Little Garden Kindergarten</p>
          <h1 className="umum-hero-title">
            Growing Bright Futures,
            <br />
            One Seed at a Time
            <br />
            in Little Garden Kindergarten
          </h1>

          <p className="umum-hero-subtitle">
            Di Little Garden Kindergarten, kami percaya bahwa masa depan yang
            cerah tidak tumbuh begitu saja; ia ditanam, dirawat, dan disinari
            dengan kasih.
          </p>

          <button
            className="umum-cta-btn"
            type="button"
            onClick={handleDaftarAnak}
          >
            Daftar Sekarang →
          </button>
        </section>

        <section className="umum-hero-right">
          <div className="umum-hero-bg-shape" />
          <img
            src="/umum-kid.jpg"
            alt="Anak ceria di Little Garden"
            className="umum-hero-image"
          />
        </section>
      </main>
    </div>
  );
}
