const axios = require('axios');

exports.getWeather = async (req, res) => {
  try {
    const city = "Yogyakarta"; // lokasi tetap

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "API key tidak ditemukan di .env" });
    }

    // Request cuaca hingga 3 hari
    const { data } = await axios.get("https://api.weatherapi.com/v1/forecast.json", {
      params: {
        key: apiKey,
        q: city,
        days: 3,
        aqi: "no",
        alerts: "no",
        lang: "id"
      }
    });

    // Format hasil menjadi 3 hari
    const hasil3Hari = data.forecast.forecastday.map((hari) => ({
      tanggal: hari.date,
      kota: data.location.name,
      suhu_max: `${hari.day.maxtemp_c}°C`,
      suhu_min: `${hari.day.mintemp_c}°C`,
      kondisi: hari.day.condition.text,
      icon: hari.day.condition.icon,
      persentase_hujan: `${hari.day.daily_chance_of_rain}%`
    }));

    res.json({
      lokasi: data.location.name,
      data_cuaca: hasil3Hari
    });

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: "Gagal mengambil data cuaca",
      error: err.response?.data || err.message
    });
  }
};
