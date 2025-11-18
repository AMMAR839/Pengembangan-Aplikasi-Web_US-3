"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState("forgot"); // 'forgot' atau 'reset'
  const [username, setUsername] = useState("");
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [userId, setUserId] = useState(searchParams.get("id") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Jika ada token & id di URL, langsung ke step reset
  useState(() => {
    if (token && userId) {
      setStep("reset");
    }
  }, []);

  async function handleForgotPassword(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal mengirim link reset");
        return;
      }

      setMessage(data.message);
      setUsername("");
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal reset password");
        return;
      }

      setMessage(data.message);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card login-card">
        <div className="auth-left">
          <img src="/login-kid.jpg" alt="Reset Password" className="auth-image" />
        </div>

        <div className="auth-right">
          <div className="auth-logo">
            <span className="auth-flower">🌼</span>
            <span className="auth-logo-text">Little Garden</span>
          </div>

          <h1 className="auth-title">
            {step === "forgot" ? "Lupa Password" : "Reset Password"}
          </h1>

          {step === "forgot" ? (
            <form className="auth-form" onSubmit={handleForgotPassword}>
              <p style={{ marginBottom: "1rem", fontSize: "14px" }}>
                Masukkan username/email Anda. Kami akan mengirimkan link reset password.
              </p>

              <label className="auth-label">
                Username / Email
                <input
                  className="auth-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>

              {error && <p className="auth-error">{error}</p>}
              {message && <p className="auth-success">{message}</p>}

              <button
                className="auth-button primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Kirim Link Reset"}
              </button>

              <button
                className="auth-link"
                type="button"
                onClick={() => router.push("/")}
                style={{ marginTop: "1rem", display: "block" }}
              >
                Kembali ke Login
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <p style={{ marginBottom: "1rem", fontSize: "14px" }}>
                Masukkan password baru Anda.
              </p>

              <label className="auth-label">
                Password Baru
                <input
                  className="auth-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </label>

              <label className="auth-label">
                Konfirmasi Password
                <input
                  className="auth-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>

              {error && <p className="auth-error">{error}</p>}
              {message && <p className="auth-success">{message}</p>}

              <button
                className="auth-button primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Reset Password"}
              </button>

              <button
                className="auth-link"
                type="button"
                onClick={() => router.push("/")}
                style={{ marginTop: "1rem", display: "block" }}
              >
                Kembali ke Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
