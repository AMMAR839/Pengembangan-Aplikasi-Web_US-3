"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    const token = searchParams.get("token");
    const username = searchParams.get("username");
    const role = searchParams.get("role");

    if (error) {
      if (error === "not_registered") {
        router.replace("/register");
      } else if (error === "already_registered") {
        router.replace("/");
      } else {
        router.replace("/");
      }
      return;
    }

    if (token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        if (username) localStorage.setItem("username", username);
        if (role) localStorage.setItem("role", role);
      }

      let path = "/umum";
      if (role === "admin") path = "/admin";
      else if (role === "parent" || role === "wali-murid") path = "/wali-murid";

      router.replace(path);
      return;
    }

    router.replace("/");
  }, [router, searchParams]);

  return (
    <main style={{ padding: 24 }}>
      <p>Memproses autentikasi Google...</p>
    </main>
  );
}
