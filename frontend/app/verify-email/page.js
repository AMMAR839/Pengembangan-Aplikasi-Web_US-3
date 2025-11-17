"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import styles from "./VerifyEmail.module.css";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get("status") || "pending";
  const email = searchParams.get("email");

  useEffect(() => {
    if (status === "success") {
      const t = setTimeout(() => {
        router.push("/");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  let title = "";
  let message = "";

  if (status === "pending") {
    title = "Cek Email Kamu";
    message =
      `Kami sudah mengirim link verifikasi ke ` +
      (email ? email : "email yang kamu daftarkan") +
      `. Silakan buka email dan klik tombol "Verifikasi Email".`;
  } else if (status === "success") {
    title = "Verifikasi Berhasil 🎉";
    message =
      "Email kamu sudah terverifikasi. Kamu akan diarahkan ke halaman login dalam beberapa detik.";
  } else if (status === "failed") {
    title = "Link Tidak Valid atau Kadaluarsa";
    message =
      "Link verifikasi yang kamu gunakan sudah tidak berlaku. Silakan lakukan register ulang.";
  } else {
    title = "Terjadi Kesalahan";
    message =
      "Terjadi kesalahan saat memproses verifikasi. Silakan coba lagi nanti.";
  }

  return (
    <div className={styles.verifyBg}>
      <div className={styles.verifyCard}>
        <h1 className={styles.verifyTitle}>{title}</h1>
        <p className={styles.verifyText}>{message}</p>

        <button
          className={styles.verifyButton}
          type="button"
          onClick={() => router.push("/")}
        >
          Kembali ke Login
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
