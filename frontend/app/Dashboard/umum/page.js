"use client";

import { useRouter } from "next/navigation";

export default function UmumDashboard() {
  const router = useRouter();

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
    }
    router.replace("/");
  }

  function handleDaftarAnak() {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      // belum login → simpan redirect, lalu ke halaman login
      localStorage.setItem("redirectAfterLogin", "/pendaftaran-anak");
      router.push("/");
    } else {
      // sudah login → langsung ke form
      router.push("/pendaftaran-anak");
    }
  }

  return (
    <div className="umum-page">
      {/* NAVBAR */}
      <header className="umum-nav">
        <div className="umum-nav-left">
          <div className="umum-logo">
            <span className="umum-logo-flower">🌼</span>
            <span className="umum-logo-text">Little Garden</span>
          </div>

          <nav className="umum-nav-links">
            <a href="#beranda">Beranda</a>
            <a href="#tentang-kami">Tentang Kami</a>
            <a href="#kurikulum">Kurikulum</a>
            <button
              type="button"
              className="auth-link"
              onClick={handleDaftarAnak}
            >
              Pendaftaran Anak
            </button>
          </nav>
        </div>

        <div className="umum-nav-right">
          <button className="umum-icon-btn" type="button">
            🔔
          </button>
          <button
            className="umum-icon-btn"
            type="button"
            onClick={handleLogout}
            title="Logout"
          >
            ⏻
          </button>
        </div>
      </header>

      {/* HERO BERANDA */}
      <section className="umum-hero" id="beranda">
        <section className="umum-hero-left">
          <p className="umum-eyebrow">Di Little Garden Kindergarten</p>
          <h1 className="umum-hero-title">
            Growing Bright Futures,
            <br />
            One Seed at a Time
            <br />
            in Little Garden Kindergarten
          </h1>

          <p className="umum-hero-subtitle">
            Di Little Garden Kindergarten, kami percaya bahwa masa depan yang
            cerah tidak tumbuh begitu saja; ia ditanam, dirawat, dan disinari
            dengan kasih.
          </p>

          <button
            className="umum-cta-btn"
            type="button"
            onClick={handleDaftarAnak}
          >
            Daftar Sekarang →
          </button>
        </section>

        <section className="umum-hero-right">
          <div className="umum-hero-bg-shape" />
          <img
            src="/umum-kid.jpg"
            alt="Anak ceria di Little Garden"
            className="umum-hero-image"
          />
        </section>
      </section>

      {/* KURIKULUM KAMI */}
      <section className="kurikulum-section" id="kurikulum">
        <div className="kurikulum-inner">
          <div className="kurikulum-image-wrap">
            <div className="kurikulum-bg-shape" />
            {/* ganti path gambar kalau namanya beda */}
            <img
              src="/kurikulum-kids.jpg"
              alt="Anak-anak Little Garden"
              className="kurikulum-image"
            />
          </div>

          <div className="kurikulum-text">
            <h2 className="kurikulum-title">Kurikulum Kami</h2>
            <p className="kurikulum-paragraph">
              Dalam memelihara rasa ingin tahu dan kreativitas anak Anda, kami
              menggunakan kurikulum berbasis bermain, yaitu IEYC. Dengan
              kurikulum ini, kami percaya dapat memberdayakan anak-anak untuk
              menjadi pelajar yang bahagia dan percaya diri, siap menghadapi
              dunia.
            </p>
            <p className="kurikulum-paragraph">
              IEYC adalah kurikulum yang dirancang untuk pendidikan anak usia
              dini (TK dan prasekolah). Kurikulum ini komprehensif dan
              berdasarkan penelitian. IEYC berfokus pada pengalaman belajar
              yang menyenangkan yang menumbuhkan rasa ingin tahu, kemampuan
              bertindak, dan kemampuan bertanya. Kurikulum ini juga
              menekankan pentingnya pembelajaran dan perkembangan yang
              berfokus pada anak.
            </p>

            <button
              className="umum-cta-btn kurikulum-cta"
              type="button"
              onClick={handleDaftarAnak}
            >
              Daftar Sekarang →
            </button>
          </div>
        </div>
      </section>

      {/* TENTANG KAMI + VISI MISI */}
      <section className="about-section" id="tentang-kami">
        <div className="about-inner">
          <h2 className="about-title">
            Sekilas Mengenai
            <br />
            Little Garden Kindergarten
          </h2>

          <p className="about-lead">
            Di Little Garden Kindergarten, kami memandang setiap anak sebagai
            benih kehidupan yang unik, lembut, dan penuh potensi. Kami percaya
            bahwa masa depan yang cerah tidak lahir begitu saja, tetapi ditanam
            dengan kasih, dirawat dengan perhatian, dan disinari oleh lingkungan
            yang penuh kehangatan.
          </p>

          <div className="about-cards">
            <div className="about-card">
              <h3 className="about-card-title">Visi Kami</h3>
              <p className="about-card-text">
                Little Garden Kindergarten menjadi tempat di mana setiap anak
                didorong dan diberi ruang untuk bertumbuh sesuai ritme dan
                keunikannya sendiri — belajar dengan bahagia, bermain dengan
                rasa ingin tahu, dan berkembang dengan cinta.
              </p>
            </div>

            <div className="about-card">
              <h3 className="about-card-title">Misi Kami</h3>
              <p className="about-card-text">
                Little Garden Kindergarten mendorong belajar dengan gembira dan
                rasa ingin tahu, membentuk anak yang mandiri dan penuh kasih,
                menciptakan lingkungan yang aman dan hangat, serta
                berkolaborasi dengan orang tua dalam setiap langkah tumbuh
                anak.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
