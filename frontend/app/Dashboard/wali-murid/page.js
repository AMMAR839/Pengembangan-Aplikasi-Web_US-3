"use client";

export default function WaliMuridDashboard() {
  const jadwal = {
    times: ["09.00 - 09.30", "09.30 - 10.30", "10.30 - 11.30", "11.30 - 12.00", "12.00"],
    days: [
      {
        name: "Senin",
        activities: [
          { title: "Senam Pagi", sub: "Senam Anak Sehat" },
          { title: "Bermain Aktif", sub: "Lempar & Tangkap Bola" },
          { title: "Waktu Cerita", sub: "Kancil & Timun" },
          { title: "Makan Siang", sub: "" },
          { title: "Jam Pulang", sub: "" },
        ],
      },
      {
        name: "Selasa",
        activities: [
          { title: "Senam Pagi", sub: "Senam SKJ" },
          { title: "Bermain Aktif", sub: "Patung & Lilin" },
          { title: "Waktu Cerita", sub: "Malin Kundang" },
          { title: "Makan Siang", sub: "" },
          { title: "Jam Pulang", sub: "" },
        ],
      },
      {
        name: "Rabu",
        activities: [
          { title: "Senam Pagi", sub: "Senam Anak Sehat" },
          { title: "Bermain Aktif", sub: "Tikus & Kucing" },
          { title: "Waktu Cerita", sub: "Malin Kundang" },
          { title: "Makan Siang", sub: "" },
          { title: "Jam Pulang", sub: "" },
        ],
      },
    ],
  };

  return (
    <div className="wali-page">
      <div className="jadwal-header">
        <div className="jadwal-title">Jadwal Harian</div>
      </div>

      <div className="schedule-container">
        <div className="schedule-grid">
          <div className="schedule-day">
            <div className="day-header">Jam</div>
            {jadwal.times.map((t) => (
              <div key={t} className="time-cell">
                {t}
              </div>
            ))}
          </div>

          {jadwal.days.map((day) => (
            <div key={day.name} className="schedule-day">
              <div className="day-header">{day.name}</div>
              {day.activities.map((act, idx) => (
                <div key={idx} className="activity-cell">
                  {act.title && <div className="activity-title">{act.title}</div>}
                  {act.sub && <div className="activity-sub">{act.sub}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="feedback-bar">
        Punya masukan, kritik terkait sekolah, program, atau guru kami? Isi form
        masukan <a href="/feedback" style={{ textDecoration: "underline" }}>di sini</a>
      </div>
    </div>
  );
}
