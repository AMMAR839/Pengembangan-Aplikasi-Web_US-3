const axios = require('axios');

exports.getWeather = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ message: "Parameter city wajib diisi" });

    // Ambil dari .env
    const apiKey = process.env.WEATHER_API_KEY || req.query.apiKey;
    if (!apiKey) {
      return res.status(500).json({ message: "API key tidak ditemukan di .env" });
    }

    // WeatherAPI.com endpoint
    const { data } = await axios.get('https://api.weatherapi.com/v1/current.json', {
      params: { key: apiKey, q: city, aqi: 'no', lang: 'id' }
    });

    res.json({
      kota: data.location?.name || city,
      suhu: `${data.current?.temp_c ?? '-'}°C`,
      kondisi: data.current?.condition?.text || '-'
    });
  } catch (err) {
    const status = err.response?.status || 500;
    const provider = err.response?.data || err.message;
    res.status(status).json({ message: "Gagal mengambil data cuaca", error: provider });
  }
};
