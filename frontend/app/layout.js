import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "./contexts/NotificationContext";
import { NotificationInitializer } from "./components/NotificationInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Little Garden Islamic School - Pendidikan Islam Berkualitas untuk Anak Usia Dini",
  description: "Little Garden Islamic School menyediakan pendidikan Islam terbaik untuk anak usia dini dengan kurikulum berkualitas, guru berpengalaman, dan fasilitas lengkap. Daftar sekarang untuk masa depan anak yang lebih baik.",
  keywords: "sekolah islam, PAUD islam, TK islam, pendidikan anak usia dini, sekolah islam terbaik, kurikulum islam, tahfidz anak, pendidikan karakter islami",
  authors: [{ name: "Little Garden Islamic School" }],
  openGraph: {
    title: "Little Garden Islamic School - Pendidikan Islam Berkualitas",
    description: "Sekolah Islam terbaik untuk anak usia dini dengan pendidikan berkualitas, guru profesional, dan lingkungan Islami yang nyaman.",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Little Garden Islamic School",
    description: "Pendidikan Islam Berkualitas untuk Anak Usia Dini",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "verification_token_here",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NotificationProvider>
          <NotificationInitializer />
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
