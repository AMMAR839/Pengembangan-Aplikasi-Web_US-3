"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Register.module.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ⬇⬇ DI SINI tempat pakai fetch + router.push
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Register gagal");
        return;
      }

      setSuccess(
        data.message || "Register berhasil. Silakan cek email untuk verifikasi."
      );

      // setelah register sukses, pindah ke halaman "menunggu verifikasi"
      router.push(
        `/verify-email?status=pending&email=${encodeURIComponent(email)}`
      );
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.registerBg}>
      <div className={styles.registerCard}>
        {/* kiri: gambar */}
        <div className={styles.registerLeft}>
          <img
            src="fotoreg.png"
            alt="Create account Little Garden"
            className={styles.registerImage}
          />
        </div>

        {/* kanan: form */}
        <div className={styles.registerRight}>
          <h1 className={styles.title}>Create An Account</h1>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label}>
              Email
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className={styles.label}>
              Username
              <input
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>

            <label className={styles.label}>
              Password
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <label className={styles.label}>
              Confirm Password
              <input
                className={styles.input}
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </label>

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            <button
              className={styles.button}
              type="submit"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Create Account"}
            </button>

            <p className={styles.bottomText}>
              Already have an account?{" "}
              <button
                type="button"
                className={styles.link}
                onClick={() => router.push("/")}
              >
                sign in here
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
