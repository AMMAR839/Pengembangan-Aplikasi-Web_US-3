"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./GoogleCallback.module.css";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const error = searchParams.get("error");
    const token = searchParams.get("token");
    const username = searchParams.get("username");
    const role = searchParams.get("role");

    // ERROR dari backend
    if (error) {
      if (error === "not_registered") {
        setErrorMessage(
          "Email Google ini belum terdaftar. Silakan daftar dulu dengan email yang sama."
        );
      } else if (error === "already_registered") {
        setErrorMessage(
          "Email Google ini sudah terdaftar. Silakan login biasa."
        );
      } else {
        setErrorMessage("Terjadi kesalahan saat login dengan Google.");
      }
      return;
    }

    // Respon aneh / kurang
    if (!token || !username || !role) {
      setErrorMessage("Respon login Google tidak lengkap.");
      return;
    }

    // Sukses → simpan & redirect
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("role", role);

        const redirect = localStorage.getItem("redirectAfterLogin");
        if (redirect) {
          localStorage.removeItem("redirectAfterLogin");
          router.replace(redirect);
        } else {
          if (role === "admin") router.replace("/admin");
          else if (role === "parent")
            router.replace("/wali-murid/dashboard");
          else router.replace("/umum");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal menyimpan sesi login Google.");
    }
  }, [router, searchParams]);

  // UI
  if (errorMessage) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Login Google Gagal</h2>
          <p className={styles.errorText}>{errorMessage}</p>
          <button
            className={styles.backButton}
            onClick={() => {
              const err = searchParams.get("error");
              if (err === "not_registered") router.push("/register");
              else router.push("/login");
            }}
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className={styles.page}>
      <div className={styles.loader}>
        <div className={styles.ring}>
          <div className={styles.ringInner} />
          <div className={styles.ringOuter} />
          <div className={styles.googleBadge}>
            <img
              src="/google-icon.svg"
              alt="Google"
              className={styles.googleImg}
            />
          </div>
        </div>
        <p className={styles.loadingTitle}>Memproses login dengan Google…</p>
        <p className={styles.loadingText}>
          Mohon tunggu sebentar, Anda akan diarahkan ke dashboard.
        </p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
