"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./GantiPassword.module.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ;

export default function GantiPasswordPage() {
  const router = useRouter();

  // form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // navbar / profile state
  const [activeNav, setActiveNav] = useState("none");
  const [openProfile, setOpenProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // Proteksi: harus login
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username") || "";

    if (!token) {
      // kalau belum login, simpan tujuan lalu ke halaman login
      localStorage.setItem("redirectAfterLogin", "/ganti-password");
      router.replace("/login");
      return;
    }

    setIsLoggedIn(true);
    setUsername(storedUsername);
  }, [router]);

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
    }
    setIsLoggedIn(false);
    setUsername("");
    setOpenProfile(false);
    router.replace("/login");
  }

  function handleProfil() {
    setOpenProfile(false);
    router.push("/profil");
  }

  function handleGantiPasswordMenu() {
    // sudah di halaman ini → cuma tutup dropdown
    setOpenProfile(false);
  }

  function handleDaftarAnak() {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("redirectAfterLogin", "/pendaftaran-anak");
      router.push("/login");
    } else {
      router.push("/pendaftaran-anak");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirm) {
      setError("Semua field wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirm) {
      setError("Password baru dan konfirmasi tidak sama.");
      return;
    }

    setLoading(true);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal mengubah password.");
        return;
      }

      setSuccess(data.message || "Password berhasil diubah.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");

      // opsional: hilangkan pesan sukses setelah 3 detik
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* NAVBAR – DISAMAKAN DENGAN UMUM */}
      <header className={styles.nav}>
        <div className={styles.navLeft}>
          <div className={styles.logo}>
            <img
              src="/logo-bw.png"
              alt="Little Garden"
              className={styles.logoImage}
            />
          </div>

          <nav className={styles.navLinks}>
            <a
              href="/#beranda"
              className={`${styles.navItem} ${
                activeNav === "beranda" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveNav("beranda")}
            >
              Beranda
            </a>

            <a
              href="/#tentang-kami"
              className={`${styles.navItem} ${
                activeNav === "tentang" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveNav("tentang")}
            >
              Tentang Kami
            </a>

            <a
              href="/#kurikulum"
              className={`${styles.navItem} ${
                activeNav === "kurikulum" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveNav("kurikulum")}
            >
              Kurikulum
            </a>

            <button
              type="button"
              className={`${styles.navItem} ${
                activeNav === "pendaftaran" ? styles.navItemActive : ""
              }`}
              onClick={() => {
                setActiveNav("pendaftaran");
                handleDaftarAnak();
              }}
            >
              Pendaftaran Anak
            </button>
          </nav>
        </div>

        <div className={styles.navRight}>
          {/* PROFILE DROPDOWN */}
          <div className={styles.profileWrapper}>
            <button
              type="button"
              className={styles.profileBtn}
              onClick={() => setOpenProfile((prev) => !prev)}
            >
              <span className={styles.profileAvatar}>👤</span>
              <span className={styles.profileLabel}>
                {isLoggedIn ? username || "Profil" : "Login"}
              </span>
            </button>

            {openProfile && (
              <div className={styles.profileMenu}>
                {isLoggedIn ? (
                  <>
                    <button
                      type="button"
                      className={styles.profileItem}
                      onClick={handleProfil}
                    >
                      <span className={styles.profileItemIcon}></span>
                      <span>Profil Saya</span>
                    </button>

                    <button
                      type="button"
                      className={styles.profileItem}
                      onClick={handleGantiPasswordMenu}
                    >
                      <span className={styles.profileItemIcon}></span>
                      <span>Ganti Password</span>
                    </button>

                    <hr className={styles.profileDivider} />

                    <button
                      type="button"
                      className={`${styles.profileItem} ${styles.profileItemDanger}`}
                      onClick={handleLogout}
                    >
                      <span className={styles.profileItemIcon}>⏻</span>
                      <span>Log Out</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={styles.profileItem}
                    onClick={() => {
                      setOpenProfile(false);
                      router.push("/login"); // halaman login
                    }}
                  >
                    <span className={styles.profileItemIcon}>🔑</span>
                    <span>Login</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>Ganti Password</h1>
            <p className={styles.subtitle}>
              Demi keamanan akun Ayah/Bunda, gunakan password yang kuat
              dan jangan dibagikan kepada siapapun.
            </p>
          </div>

          {/* TOAST MESSAGE DI DALAM CARD */}
          {success && (
            <div className={styles.toastSuccess}>
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className={styles.toastError}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label>
                Password Lama
                <span className={styles.requiredMark}>*</span>
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password yang sekarang"
                required
              />
            </div>

            <div className={styles.field}>
              <label>
                Password Baru
                <span className={styles.requiredMark}>*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
              />
            </div>

            <div className={styles.field}>
              <label>
                Konfirmasi Password Baru
                <span className={styles.requiredMark}>*</span>
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Ketik ulang password baru"
                required
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Password"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
