"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function goToDashboard(role) {
    let path = "/umum"; // default user biasa
    if (role === "admin") path = "/admin";
    else if (role === "parent" ) path = "/wali-murid/dashboard";
    router.replace(path);
  }

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
      const res = await fetch(`${API_URL}/auth/login`, {
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
    window.location.href = `${API_URL}/auth/google/login`;
  }

  return (
  <div className={styles.loginBg}>
    <div className={styles.loginCard}>
      <div className={styles.loginLeft}>
        <img
          src="/loginleft.jpg"
          alt="Login"
          className={styles.loginImage}
        />
      </div>

      <div className={styles.loginRight}>
        <img src="/leaf.svg" alt="Logo" className={styles.bgIcon}/>
          <div className={styles.logo}>
            <img
              src="/logo-bw.png"
              alt="Little Garden"
              className={styles.logoImage}
            />
          </div>

        
        <div className={styles.rightInner}>
          <h1 className={styles.title}>Selamat Datang</h1>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.fieldLabel}>
              username
              <input
                className={styles.inputUnderline}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>

            <label className={styles.fieldLabel}>
              password
              <input
                className={styles.inputUnderline}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <div className={styles.forgot}>
              <button
                type="button"
                className={styles.link}
                onClick={() => alert("Lupa password belum dibuat")}
              >
                Lupa Password
              </button>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              className={`${styles.button} ${styles.primaryButton}`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Login"}
            </button>

            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              type="button"
              onClick={handleGoogleLogin}
            >
              <span className={styles.googleIcon}>
                <img
                  src="/google-icon.svg"
                  alt=""
                  className={styles.googleImg}
                />
              </span>
              <span>Login With Google</span>
            </button>


            <p className={styles.bottomText}>
              Belum punya akun?{" "}
              <button
                type="button"
                className={styles.link}
                onClick={() => router.push("/register")}
              >
                Register di sini
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
);
}