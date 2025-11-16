"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // kirim data ke backend -> /api/auth/register
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Register gagal");
        return;
      }

      // kalau sukses, kasih pesan lalu arahkan ke login
      setSuccess("Akun berhasil dibuat, silakan login");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleRegister() {
    // bedakan dari login → pakai /google/register
    window.location.href = `${API_URL}/api/auth/google/register`;
  }

  return (
    <div className="auth-bg">
      <div className="auth-card register-card">
        <div className="auth-left">
          <img
            src="/register-kid.jpg"
            alt="Register"
            className="auth-image"
          />
        </div>

        <div className="auth-right">
          <div className="auth-logo">
            <span className="auth-flower">🌼</span>
            <span className="auth-logo-text">Little Garden</span>
          </div>

          <h1 className="auth-title">Buat Akun Baru</h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-label">
              username
              <input
                className="auth-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>

            <label className="auth-label">
              password
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error && <p className="auth-error">{error}</p>}
            {success && <p className="daftar-success">{success}</p>}

            <button
              className="auth-button primary dark"
              type="submit"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Buat Akun"}
            </button>

            <button
              className="auth-button secondary"
              type="button"
              onClick={handleGoogleRegister}
            >
              <span className="auth-google-icon">G</span>
              <span>Register With Google</span>
            </button>

            <p className="auth-bottom-text">
              Sudah punya akun?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => router.push("/")}
              >
                Login di sini
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
