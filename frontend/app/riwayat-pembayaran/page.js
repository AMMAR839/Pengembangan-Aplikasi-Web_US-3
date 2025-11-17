"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../pendaftaran-anak/PendaftaranAnak.module.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function RiwayatPembayaranPage() {
  const router = useRouter();

  const [activeNav, setActiveNav] = useState("riwayat");
  const [openProfile, setOpenProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Proteksi login + load riwayat
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username") || "";

    if (!token) {
      localStorage.setItem("redirectAfterLogin", "/riwayat-pembayaran");
      router.replace("/");
      return;
    }

    setIsLoggedIn(true);
    setUsername(storedUsername);

    fetchPayments(token);
  }, [router]);

  async function fetchPayments(token) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/payment/my-payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal memuat riwayat pembayaran.");
        setPayments([]);
        return;
      }

      setPayments(data || []);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat memuat riwayat pembayaran.");
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
    setOpenProfile(false);
    router.push("/profil");
  }

  function handleGantiPassword() {
    setOpenProfile(false);
    router.push("/ganti-password");
  }

  async function handlePayAgain(nik) {
    setError("");
    setInfo("");

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      if (!token) {
        setError("Anda harus login untuk melakukan pembayaran.");
        return;
      }

      const res = await fetch(`${API_URL}/payment/checkout-by-nik`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nik }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal memulai pembayaran.");
        return;
      }

      if (data.payment_url) {
        window.open(data.payment_url, "_blank");
        setInfo(
          data.message ||
            "Silakan lanjutkan pembayaran di tab baru (QRIS / metode lain)."
        );
      } else {
        setInfo(data.message || "Status pembayaran berhasil diambil.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menghubungi server pembayaran.");
    }
  }

  const statusLabel = (s) => {
    switch (s) {
      case "pending":
        return "Menunggu Pembayaran";
      case "settlement":
        return "Berhasil";
      case "failed":
        return "Gagal";
      case "expire":
        return "Kedaluwarsa";
      case "cancel":
        return "Dibatalkan";
      case "deny":
        return "Ditolak";
      default:
        return s;
    }
  };

  const statusClass = (s) => {
    switch (s) {
      case "pending":
        return styles.statusPending;
      case "settlement":
        return styles.statusSettlement;
      case "failed":
        return styles.statusFailed;
      case "expire":
        return styles.statusExpire;
      case "cancel":
        return styles.statusCancel;
      case "deny":
        return styles.statusDeny;
      default:
        return styles.statusPending;
    }
  };

  return (
    <div className={styles.page}>
      {/* NAVBAR */}
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

            <Link
              href="/pendaftaran-anak"
              className={`${styles.navItem} ${
                activeNav === "pendaftaran" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveNav("pendaftaran")}
            >
              Pendaftaran Anak
            </Link>

            <span
              className={`${styles.navItem} ${
                activeNav === "riwayat" ? styles.navItemActive : ""
              }`}
            >
              Riwayat Pembayaran
            </span>
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
                      <span>Profil Saya</span>
                    </button>

                    <button
                      type="button"
                      className={styles.profileItem}
                      onClick={handleGantiPassword}
                    >
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
                      router.push("/");
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

      {/* MAIN */}
      <main className={styles.main}>
        <section className={styles.card}>
          <div className={styles.left}>
            <p className={styles.badge}>Riwayat Pembayaran</p>
            <h2 className={styles.title}>Transaksi Biaya Pendaftaran</h2>
            <p className={styles.subtitle}>
              Lihat status pembayaran biaya pendaftaran anak: menunggu,
              berhasil, kedaluwarsa, dan lainnya.
            </p>

            {error && <p className={styles.error}>{error}</p>}
            {info && <p className={styles.success}>{info}</p>}

            {loading ? (
              <p>Sedang memuat riwayat pembayaran...</p>
            ) : payments.length === 0 ? (
              <p>Belum ada transaksi pembayaran yang tercatat.</p>
            ) : (
              <div className={styles.historyWrapper}>
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>NIK Anak</th>
                      <th>Order ID</th>
                      <th>Nominal</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p._id}>
                        <td>
                          {new Date(p.createdAt).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td>{p.studentNik}</td>
                        <td>{p.orderId}</td>
                        <td>
                          Rp{" "}
                          {Number(p.amount || 0).toLocaleString("id-ID")}
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${statusClass(
                              p.status
                            )}`}
                          >
                            {statusLabel(p.status)}
                          </span>
                        </td>
                        <td>
                          {p.status === "pending" ? (
                            <button
                              type="button"
                              className={styles.payAgainBtn}
                              onClick={() => handlePayAgain(p.studentNik)}
                            >
                              Lanjutkan Pembayaran
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
