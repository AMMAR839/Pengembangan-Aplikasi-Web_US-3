"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL 

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Password dan konfirmasi tidak sama");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // backend sekarang pakai username + password.
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Register gagal");
        return;
      }

      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleRegister() {
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
          <h1 className="auth-title">Create An Account</h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-label">
              Email
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="auth-label">
              Username
              <input
                className="auth-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>

            <label className="auth-label">
              Password
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <label className="auth-label">
              Confirm Password
              <input
                className="auth-input"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button
              className="auth-button primary dark"
              type="submit"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Create Account"}
            </button>

            <div className="auth-or">or</div>

            <button
              type="button"
              className="auth-button secondary"
              onClick={handleGoogleRegister}
            >
              <span className="auth-google-icon">G</span>
              <span>Register With Google</span>
            </button>

            <p className="auth-bottom-text">
              Already have an account?{" "}
              <button
                type="button"
                className="auth-link"
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
