export function labelRelativeDate(dateStr) {
  const [day, month, year] = dateStr.split('-').map(Number);
  const inputDate = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0,0,0,0);
  inputDate.setHours(0,0,0,0);

  const diffDays = (inputDate - today) / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Besok";
  if (diffDays === 2) return "Lusa";

  return null;
}

export function formatTanggalLengkap(dateStr) {
  const [day, month, year] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const bulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  return `${hari[date.getDay()]}, ${year} ${bulan[month - 1]} ${day}`;
}

export function formatTanggalSmart(dateStr) {
  const relative = labelRelativeDate(dateStr);
  const fullDate = formatTanggalLengkap(dateStr);

  return relative ? `${relative} • ${fullDate}` : fullDate;
}
