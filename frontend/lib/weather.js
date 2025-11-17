export async function getWeather(city) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/weather?city=${city}`
  );

  if (!res.ok) {
    throw new Error("Gagal mengambil data cuaca");
  }

  return res.json();
}
