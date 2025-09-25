const axios = require('axios');

exports.getWeather = async (req, res) => {
  try {
    const city = req.query.city || 'Jakarta';
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=id`
    );

    const weatherData = {
      city: response.data.name,
      temperature: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      icon: response.data.weather[0].icon
    };

    res.json(weatherData);
  } catch (err) {
    res.status(500).json({ 
      message: 'Gagal mengambil data cuaca',
      error: err.response?.data?.message || err.message 
    });
  }
};

exports.getWeatherForecast = async (req, res) => {
  try {
    const city = req.query.city || 'Jakarta';
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=id`
    );


    const forecast = response.data.list
      .filter((item, index) => index % 8 === 0)
      .slice(0, 5) 
      .map(item => ({
        date: new Date(item.dt * 1000).toLocaleDateString('id-ID'),
        temperature: Math.round(item.main.temp),
        description: item.weather[0].description,
        icon: item.weather[0].icon
      }));

    res.json({
      city: response.data.city.name,
      forecast
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Gagal mengambil prediksi cuaca',
      error: err.response?.data?.message || err.message 
    });
  }
};
