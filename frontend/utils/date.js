// export function labelRelativeDate(dateStr) {
//   const [day, month, year] = dateStr.split('-').map(Number);
//   const inputDate = new Date(year, month - 1, day);
//   const LabelName =['Hari ini', 'Besok', 'Lusa'];

//   const today = new Date();
//   today.setHours(0,0,0,0);
//   inputDate.setHours(0,0,0,0);

//   diffDays = (inputDate - today) / (1000 * 60 * 60 * 24);

//   diffDays = Math.round(diffDays);
  
//   relativeDate = LabelName[diffDays] || null;

//   return relativeDate;
// }


export function formatTanggalLengkap(dateStr) {
  const [day, month, year] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const bulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  return `${day} ${bulan[month - 1]} ${year}`;
}

export function formatHari(dateStr) {
  const [day, month, year] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const bulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  return `${hari[date.getDay()]}`;
}

export function formatHariRelatif(dateStr) {
  const [day, month, year] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const bulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  return `${hari[date.getDay()]}`;
}
// export function formatTanggalSmart(dateStr) {
//   const fullDate = formatTanggalLengkap(dateStr);
//   const Hari = formatHari(dateStr);

//   return `${fullDate}, ${Hari}`;
// }
