"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function DaftarAnakPage() {
  const router = useRouter();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/student/my-children`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setChildren(data);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Daftar Anak</h1>
      <p>Halaman daftar anak akan ditampilkan di sini.</p>
      
      {children.length === 0 ? (
        <p>Belum ada data anak terdaftar.</p>
      ) : (
        <ul>
          {children.map((child) => (
            <li key={child._id}>{child.nama}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
