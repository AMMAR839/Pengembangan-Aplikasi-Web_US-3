"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function goToDashboard(role) {
    let path = "Dashboard/umum"; // default user biasa
    if (role === "admin") path = "/admin";
    else if (role === "parent" || role === "wali-murid") path = "/wali-murid";
    router.replace(path);
  }

  // dipakai setelah login sukses
  function goAfterLogin(role) {
    if (typeof window !== "undefined") {
      const redirect = localStorage.getItem("redirectAfterLogin");
      if (redirect) {
        localStorage.removeItem("redirectAfterLogin");
        router.replace(redirect);
        return;
      }
    }
    goToDashboard(role);
  }

  // kalau sudah login dan buka "/" manual → lempar ke dashboard
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) goToDashboard(role);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login gagal");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);
      }

      goAfterLogin(data.role);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = `${API_URL}/api/auth/google/login`;
  }

  return (
    <div className="auth-bg">
      <div className="auth-card login-card">
        <div className="auth-left">
          <img src="/login-kid.jpg" alt="Login" className="auth-image" />
        </div>

        <div className="auth-right">
          <div className="auth-logo">
            <span className="auth-flower">🌼</span>
            <span className="auth-logo-text">Little Garden</span>
          </div>

          <h1 className="auth-title">Selamat Datang</h1>

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

            <div className="auth-forgot">
              <button
                type="button"
                className="auth-link"
                onClick={() => alert("Lupa password belum dibuat")}
              >
                Lupa Password
              </button>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button
              className="auth-button primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Login"}
            </button>

            <button
              className="auth-button secondary"
              type="button"
              onClick={handleGoogleLogin}
            >
              <span className="auth-google-icon">G</span>
              <span>Login With Google</span>
            </button>

            <p className="auth-bottom-text">
              Belum punya akun?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => router.push("/register")}
              >
                Register di sini
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
