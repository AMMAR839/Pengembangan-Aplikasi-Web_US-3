"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./PendaftaranAnak.module.css";

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

  // Proteksi: harus login dulu
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      // simpan redirect supaya setelah login balik ke sini
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
        setError(data.message || "Gagal mendaftarkan anak.");
        return;
      }

      setSuccess("Data anak berhasil didaftarkan 🎉");
      setFirstName("");
      setLastName("");
      setAlamat("");
      setTanggalLahir("");
      setJenisKelamin("");
      setNamaOrangTua("");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* NAVBAR */}
      <header className={styles.nav}>
        <div className={styles.navLeft}>
          <div className={styles.logo}>
            {/* kalau punya logo PNG sendiri, ganti span ini dengan <img /> */}
            <span className={styles.logoFlower}>🌼</span>
            <span className={styles.logoText}>Little Garden</span>
          </div>

          <nav className={styles.navLinks}>
            <Link href="/umum" className={styles.navItem}>
              Beranda
            </Link>
            <a href="/umum#tentang-kami" className={styles.navItem}>
              Tentang Kami
            </a>
            <a href="/umum#kurikulum" className={styles.navItem}>
              Kurikulum
            </a>
            <span
              className={`${styles.navItem} ${styles.navItemActive}`}
            >
              Pendaftaran Anak
            </span>
          </nav>
        </div>

        <div className={styles.navRight}>
          <button className={styles.iconBtn} type="button">
            🔔
          </button>
          <button
            className={styles.iconBtn}
            type="button"
            title="Logout"
            onClick={handleLogout}
          >
            ⏻
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        <section className={styles.card}>
          {/* kiri: form */}
          <div className={styles.left}>
            <h2 className={styles.title}>Pendaftaran Anak</h2>
            <p className={styles.subtitle}>
              Lengkapi data berikut untuk mendaftarkan putra / putri
              Anda di Little Garden Kindergarten.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Nama Depan</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Nama Belakang</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>Alamat</label>
                <input
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Tanggal Lahir</label>
                  <input
                    type="date"
                    value={tanggalLahir}
                    onChange={(e) =>
                      setTanggalLahir(e.target.value)
                    }
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>Jenis Kelamin</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) =>
                      setJenisKelamin(e.target.value)
                    }
                    required
                  >
                    <option value="">Pilih...</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label>Nama Orang Tua</label>
                <input
                  value={namaOrangTua}
                  onChange={(e) =>
                    setNamaOrangTua(e.target.value)
                  }
                  required
                />
              </div>

              {error && (
                <p className={styles.error}>{error}</p>
              )}
              {success && (
                <p className={styles.success}>{success}</p>
              )}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Kirim Pendaftaran"}
              </button>
            </form>
          </div>

          {/* kanan: ilustrasi anak + shape */}
          <div className={styles.right}>
            <div className={styles.bgShapeOuter} />
            <div className={styles.bgShapeInner} />
            <img
              src="/daftar-kid.png" // taruh file ini di /public
              alt="Anak Little Garden"
              className={styles.kidImage}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
