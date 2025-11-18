"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Profil.module.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProfilPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  // navbar state
  const [activeNav, setActiveNav] = useState("none");
  const [openProfile, setOpenProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username") || "";

    if (!token) {
      // belum login → balik ke halaman login
      router.replace("/");
      return;
    }

    setIsLoggedIn(true);
    setUsername(storedUsername);
    fetchProfile(token);
  }, [router]);

  async function fetchProfile(token) {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        // token sudah invalid
        handleLogout();
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal mengambil data profil");
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan pada server");
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
    setIsLoggedIn(false);
    setUsername("");
    setOpenProfile(false);
    router.replace("/");
  }

  function handleProfil() {
    // sudah di halaman ini, cukup tutup dropdown
    setOpenProfile(false);
  }

  function handleGantiPassword() {
    setOpenProfile(false);
    router.push("/ganti-password");
  }

  function handleDaftarAnak() {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("redirectAfterLogin", "/pendaftaran-anak");
      router.push("/");
    } else {
      router.push("/pendaftaran-anak");
    }
  }

  return (
    <div className={styles.page}>
      {/* NAVBAR – disamakan dengan UmumDashboard */}
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
            <Link
              href="/umum#beranda"
              className={`${styles.navItem} ${
                activeNav === "beranda" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveNav("beranda")}
            >
              Beranda
            </Link>

            <Link
              href="/umum#tentang-kami"
              className={`${styles.navItem} ${
                activeNav === "tentang" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveNav("tentang")}
            >
              Tentang Kami
            </Link>

            <Link
              href="/umum#kurikulum"
              className={`${styles.navItem} ${
                activeNav === "kurikulum" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveNav("kurikulum")}
            >
              Kurikulum
            </Link>

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
                      onClick={handleGantiPassword}
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
                      router.push("/"); // ke halaman login
                    }}
                  >
                    <span className={styles.profileItemIcon}></span>
                    <span>Login</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT – kartu profil */}
      <main className={styles.main}>
        <section className={styles.card}>
          <h1 className={styles.title}>Profil Saya</h1>
          <p className={styles.subtitle}>
            Informasi akun Little Garden yang terdaftar di sistem.
          </p>

          {loading && (
            <p className={styles.infoText}>Memuat profil...</p>
          )}

          {error && <p className={styles.error}>{error}</p>}

          {profile && (
            <div className={styles.profileGrid}>
              <div className={styles.profileItemRow}>
                <span className={styles.key}>Email</span>
                <span className={styles.value}>{profile.email}</span>
              </div>

              <div className={styles.profileItemRow}>
                <span className={styles.key}>Username</span>
                <span className={styles.value}>{profile.username}</span>
              </div>

              <div className={styles.profileItemRow}>
                <span className={styles.key}>Role</span>
                <span className={styles.value}>{profile.role}</span>
              </div>

              <div className={styles.profileItemRow}>
                <span className={styles.key}>Terdaftar sejak</span>
                <span className={styles.value}>
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    : "-"}
                </span>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
