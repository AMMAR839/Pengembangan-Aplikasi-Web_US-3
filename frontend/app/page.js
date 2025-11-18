"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./UmumDashboard.module.css";

export default function UmumDashboard() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("beranda");
  const [openProfile, setOpenProfile] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // cek login waktu pertama kali render
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username") || "";
    setIsLoggedIn(!!token);
    setUsername(storedUsername);
  }, []);

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
    }
    setIsLoggedIn(false);
    setUsername("");
    setOpenProfile(false);
    router.replace("/login");
  }

  function handleProfil() {
    // ganti "/profil" kalau rute profil kamu beda
    setOpenProfile(false);
    router.push("/profil");
  }

  function handleGantiPassword() {
    // ganti "/ganti-password" kalau rutenya beda
    setOpenProfile(false);
    router.push("/ganti-password");
  }

  // kalau mau daftar anak → cek login dulu
  function handleDaftarAnak() {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("redirectAfterLogin", "/pendaftaran-anak");
      router.push("/login"); // halaman login
    } else {
      router.push("/pendaftaran-anak");
    }
  }

  return (
    <div className={styles.page}>
      {/* ========== NAVBAR ========== */}
      <header className={styles.nav}>
        <div className={styles.navLeft}>
          <div className={styles.logo}>
            <img
              src="/logo-bw.png"
              alt="Little Garden"
              className={styles.logoImage}
            />
          </div>

          <nav className={styles.navLinks}>
            <a
              href="#beranda"
              className={`${styles.navItem} ${
                activeNav === "beranda" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveNav("beranda")}
            >
              Beranda
            </a>

            <a
              href="#tentang-kami"
              className={`${styles.navItem} ${
                activeNav === "tentang" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveNav("tentang")}
            >
              Tentang Kami
            </a>

            <a
              href="#kurikulum"
              className={`${styles.navItem} ${
                activeNav === "kurikulum" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveNav("kurikulum")}
            >
              Kurikulum
            </a>

            <button
              type="button"
              className={`${styles.navItem} ${
                activeNav === "pendaftaran" ? styles.navItemActive : ""
              }`}
              onClick={() => {
                setActiveNav("pendaftaran");
                handleDaftarAnak();
              }}
            >
              Pendaftaran Anak
            </button>
          </nav>
        </div>

        <div className={styles.navRight}>

          {/* PROFIL / LOGIN DROPDOWN */}
          <div className={styles.profileWrapper}>
            <button
              type="button"
              className={styles.profileBtn}
              onClick={() => setOpenProfile((prev) => !prev)}
            >
              <span className={styles.profileAvatar}>👤</span>
              <span className={styles.profileLabel}>
                {isLoggedIn ? username || "Profil" : "Login"}
              </span>
            </button>

            {openProfile && (
              <div className={styles.profileMenu}>
                {isLoggedIn ? (
                  <>
                    <button
                      type="button"
                      className={styles.profileItem}
                      onClick={handleProfil}
                    >
                     
                      <span>Profil Saya</span>
                    </button>

                    <button
                      type="button"
                      className={styles.profileItem}
                      onClick={handleGantiPassword}
                    >
                      <span>Ganti Password</span>
                    </button>

                    <hr className={styles.profileDivider} />

                    <button
                      type="button"
                      className={`${styles.profileItem} ${styles.profileItemDanger}`}
                      onClick={handleLogout}
                    >
                      <span className={styles.profileItemIcon}>⏻</span>
                      <span>Log Out</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={styles.profileItem}
                    onClick={() => {
                      setOpenProfile(false);
                      router.push("/login"); // halaman login
                    }}
                  >
                    <span>Login</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========== HERO / BERANDA ========== */}
      <section className={styles.hero} id="beranda">
        <section className={styles.heroLeft}>
          <p className={styles.eyebrow}>Di Little Garden Kindergarten</p>
          <h1 className={styles.heroTitle}>
            Growing Bright Futures,
            <br />
            One Seed at a Time
            <br />
            in Little Garden Kindergarten
          </h1>

          <p className={styles.heroSubtitle}>
            Di Little Garden Kindergarten, kami percaya bahwa masa depan yang
            cerah tidak tumbuh begitu saja; ia ditanam, dirawat, dan disinari
            dengan kasih.
          </p>

          <button
            className={styles.ctaBtn}
            type="button"
            onClick={() => {
              setActiveNav("pendaftaran");
              handleDaftarAnak();
            }}
          >
            Daftar Sekarang →
          </button>
        </section>

        <section className={styles.heroRight}>
          <div className={styles.heroBgShape} />
          <img
            src="images/kids-having-fun-jungle-themed-party.jpg"
            alt="Anak ceria di Little Garden"
            className={styles.heroImage}
          />
        </section>
      </section>

     
      <section className={styles.kurikulumSection} id="kurikulum">
        <div className={styles.kurikulumInner}>
          <div className={styles.kurikulumImageWrap}>
            <div className={styles.kurikulumBgShape} />
            <img
              src="images/group-children-lying-reading-grass-field.jpg"
              alt="Anak-anak Little Garden"
              className={styles.kurikulumImage}
            />
          </div>

          <div className={styles.kurikulumText}>
            <h2 className={styles.kurikulumTitle}>Kurikulum Kami</h2>

            <p className={styles.kurikulumParagraph}>
              Dalam memelihara rasa ingin tahu dan kreativitas anak Anda, kami
              menggunakan kurikulum berbasis bermain, yaitu IEYC. Dengan
              kurikulum ini, kami percaya dapat memberdayakan anak-anak untuk
              menjadi pelajar yang bahagia dan percaya diri, siap menghadapi
              dunia.
            </p>

            <p className={styles.kurikulumParagraph}>
              IEYC adalah kurikulum yang dirancang untuk pendidikan anak usia
              dini (TK dan prasekolah). Kurikulum ini komprehensif dan
              berdasarkan penelitian. IEYC berfokus pada pengalaman belajar
              yang menyenangkan yang menumbuhkan rasa ingin tahu, kemampuan
              bertindak, dan kemampuan bertanya. Kurikulum ini juga menekankan
              pentingnya pembelajaran dan perkembangan yang berfokus pada anak.
            </p>

          </div>
        </div>
      </section>

      {/* ========== TENTANG KAMI ========== */}
      <section className={styles.aboutSection} id="tentang-kami">
        <div className={styles.aboutInner}>
          <h2 className={styles.aboutTitle}>
            Sekilas Mengenai
            <br />
            Little Garden Kindergarten
          </h2>

          <p className={styles.aboutLead}>
            Di Little Garden Kindergarten, kami memandang setiap anak sebagai
            benih kehidupan yang unik, lembut, dan penuh potensi. Kami percaya
            bahwa masa depan yang cerah tidak lahir begitu saja, tetapi ditanam
            dengan kasih, dirawat dengan perhatian, dan disinari oleh lingkungan
            yang penuh kehangatan.
          </p>

          <div className={styles.aboutCards}>
            <div className={styles.aboutCard}>
              <h3 className={styles.aboutCardTitle}>Visi Kami</h3>
              <p className={styles.aboutCardText}>
                Little Garden Kindergarten menjadi tempat di mana setiap anak
                didorong dan diberi ruang untuk bertumbuh sesuai ritme dan
                keunikannya sendiri — belajar dengan bahagia, bermain dengan
                rasa ingin tahu, dan berkembang dengan cinta.
              </p>
            </div>

            <div className={styles.aboutCard}>
              <h3 className={styles.aboutCardTitle}>Misi Kami</h3>
              <p className={styles.aboutCardText}>
                Little Garden Kindergarten mendorong belajar dengan gembira dan
                rasa ingin tahu, membentuk anak yang mandiri dan penuh kasih,
                menciptakan lingkungan yang aman dan hangat, serta berkolaborasi
                dengan orang tua dalam setiap langkah tumbuh anak.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
