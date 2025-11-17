"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./PendaftaranAnak.module.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PendaftaranAnakPage() {
  const router = useRouter();

  // form state
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [golonganDarah, setGolonganDarah] = useState("");
  const [agama, setAgama] = useState("");
  const [namaOrangtua, setNamaOrangtua] = useState("");
  const [noHPOrangtua, setNoHPOrangtua] = useState("");
  const [alergiMakanan, setAlergiMakanan] = useState("");
  const [catatanKesehatan, setCatatanKesehatan] = useState("");

  const [agree, setAgree] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // untuk pembayaran
  const [lastNikForPayment, setLastNikForPayment] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  // navbar state
  const [activeNav, setActiveNav] = useState("pendaftaran");
  const [openProfile, setOpenProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // Proteksi: harus login dulu
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username") || "";

    if (!token) {
      // kalau belum login, simpan tujuan lalu ke halaman login
      localStorage.setItem("redirectAfterLogin", "/pendaftaran-anak");
      router.replace("/");
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

      const res = await fetch(`${API_URL}/api/student/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nik,
          nama,
          alamat,
          tanggalLahir,
          jenisKelamin,
          golonganDarah,
          agama,
          namaOrangtua,
          noHPOrangtua,
          alergiMakanan,
          catatanKesehatan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal mendaftarkan anak.");
        return;
      }

      // Simpan NIK terakhir untuk pembayaran
      setLastNikForPayment(nik);

      setSuccess(
        "Data anak berhasil didaftarkan . Silakan lanjut ke pembayaran."
      );
      setNik("");
      setNama("");
      setAlamat("");
      setTanggalLahir("");
      setJenisKelamin("");
      setGolonganDarah("");
      setAgama("");
      setNamaOrangtua("");
      setNoHPOrangtua("");
      setAlergiMakanan("");
      setCatatanKesehatan("");
      setAgree(false);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  }

  // Panggil Midtrans Snap lewat backend
  async function handleCheckout() {
    setError("");
    setSuccess("");

    if (!lastNikForPayment) {
      setError(
        "NIK anak untuk pembayaran tidak ditemukan. Silakan isi ulang formulir."
      );
      return;
    }

    setPaymentLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      if (!token) {
        setError("Anda harus login untuk melakukan pembayaran.");
        return;
      }

      const res = await fetch(`${API_URL}/api/payment/checkout-by-nik`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nik: lastNikForPayment }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal memulai pembayaran.");
        return;
      }

      // Redirect / open tab ke Midtrans Snap → QRIS akan tampil di sana
      if (data.payment_url) {
        window.open(data.payment_url, "_blank");
        setSuccess(
          data.message ||
            "Silakan lanjutkan pembayaran di tab baru (QRIS / metode lain)."
        );
      } else {
        setSuccess(data.message || "Status pembayaran berhasil diambil.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menghubungi server pembayaran.");
    } finally {
      setPaymentLoading(false);
    }
  }

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

            <span
              className={`${styles.navItem} ${
                activeNav === "pendaftaran" ? styles.navItemActive : ""
              }`}
            >
              Pendaftaran Anak
            </span>

            <Link
              href="/riwayat-pembayaran"
              className={`${styles.navItem} ${
                activeNav === "riwayat" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveNav("riwayat")}
            >
              Riwayat Pembayaran
            </Link>
          </nav>
        </div>

        <div className={styles.navRight}>
          {/* PROFILE / LOGIN DROPDOWN */}
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

      {/* MAIN – card form saja */}
      <main className={styles.main}>
        <section className={styles.card}>
          <div className={styles.left}>
            <p className={styles.badge}>Formulir Pendaftaran</p>
            <h2 className={styles.title}>Daftarkan Little Explorer Anda</h2>
            <p className={styles.subtitle}>
              Isi data di bawah ini dengan lengkap dan benar. Tim Little Garden
              akan menghubungi Ayah/Bunda setelah berkas diverifikasi.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>
                    NIK Anak
                    <span className={styles.requiredMark}>*</span>
                  </label>
                  <input
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="16 digit NIK"
                    maxLength={16}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>
                    Nama Lengkap Anak
                    <span className={styles.requiredMark}>*</span>
                  </label>
                  <input
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Sesuai akta kelahiran"
                    required
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>
                    Tanggal Lahir
                    <span className={styles.requiredMark}>*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>
                    Jenis Kelamin
                    <span className={styles.requiredMark}>*</span>
                  </label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value)}
                    required
                  >
                    <option value="">Pilih...</option>
                    <option value="Laki-Laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label>
                  Alamat Lengkap
                  <span className={styles.requiredMark}>*</span>
                </label>
                <input
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Nama jalan, RT/RW, kelurahan, kecamatan"
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>
                    Nama Orang Tua / Wali
                    <span className={styles.requiredMark}>*</span>
                  </label>
                  <input
                    value={namaOrangtua}
                    onChange={(e) => setNamaOrangtua(e.target.value)}
                    placeholder="Nama Ayah / Bunda / Wali"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>
                    No. HP Orang Tua
                    <span className={styles.requiredMark}>*</span>
                  </label>
                  <input
                    value={noHPOrangtua}
                    onChange={(e) => setNoHPOrangtua(e.target.value)}
                    placeholder="0812xxxxxxx"
                    required
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Golongan Darah</label>
                  <select
                    value={golonganDarah}
                    onChange={(e) => setGolonganDarah(e.target.value)}
                  >
                    <option value="">Tidak tahu / kosong</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label>Agama</label>
                  <input
                    value={agama}
                    onChange={(e) => setAgama(e.target.value)}
                    placeholder="Islam, Kristen, dll"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>Alergi Makanan (jika ada)</label>
                <input
                  value={alergiMakanan}
                  onChange={(e) => setAlergiMakanan(e.target.value)}
                  placeholder="Contoh: susu sapi, telur, seafood"
                />
              </div>

              <div className={styles.field}>
                <label>Catatan Kesehatan</label>
                <textarea
                  className={styles.textarea}
                  value={catatanKesehatan}
                  onChange={(e) => setCatatanKesehatan(e.target.value)}
                  placeholder="Riwayat penyakit, obat rutin, dll (opsional)"
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}
              {success && <p className={styles.success}>{success}</p>}

              <div className={styles.agreement}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  <span>
                    Dengan mengirim formulir ini, Ayah/Bunda menyetujui bahwa
                    data yang diisi adalah benar dan dapat digunakan untuk
                    keperluan administrasi sekolah.
                  </span>
                </label>
              </div>

              {/* BUTTON GROUP: submit + bayar */}
              <div className={styles.dualButtons}>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading || !agree}
                >
                  {loading ? "Menyimpan data..." : "Kirim Pendaftaran"}
                </button>

                {lastNikForPayment && (
                  <button
                    type="button"
                    className={styles.payBtn}
                    onClick={handleCheckout}
                    disabled={paymentLoading}
                  >
                    {paymentLoading
                      ? "Membuka halaman pembayaran..."
                      : "Bayar Biaya Pendaftaran"}
                  </button>
                )}
              </div>
            </form>

            <p className={styles.helperText}>
              Ingin mengecek status pembayaran sebelumnya? Buka menu{" "}
              <strong>Riwayat Pembayaran</strong> di navbar.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
