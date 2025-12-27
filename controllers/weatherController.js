const axios = require('axios');

exports.getWeather = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ message: "Parameter city wajib diisi" });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "API key tidak ditemukan di .env" });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=id`
    );

    res.json({
      kota: response.data.name,
      suhu: response.data.main.temp + "°C",
      kondisi: response.data.weather[0].description
    });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data cuaca", error: err.message });
  }
};
