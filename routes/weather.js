const express = require('express');
const router = express.Router();
const { getWeather, getWeatherForecast } = require('../controllers/weatherController');
const { auth } = require('../middleware/auth');

router.get('/current', auth, getWeather);
router.get('/forecast', auth, getWeatherForecast);

module.exports = router;
