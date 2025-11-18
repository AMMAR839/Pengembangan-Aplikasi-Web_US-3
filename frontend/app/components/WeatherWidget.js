'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function WeatherWidget({ city = 'Jakarta' }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWeather();
  }, [city]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/api/weather?city=${encodeURIComponent(city)}`);
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data cuaca');
      }
      
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Tidak dapat mengambil data cuaca');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (kondisi) => {
    if (!kondisi) return '🌤️';
    const text = kondisi.toLowerCase();
    if (text.includes('cerah') || text.includes('sunny')) return '☀️';
    if (text.includes('hujan') || text.includes('rain')) return '🌧️';
    if (text.includes('mendung') || text.includes('cloud')) return '☁️';
    if (text.includes('gerimis') || text.includes('drizzle')) return '🌦️';
    if (text.includes('badai') || text.includes('thunder')) return '⛈️';
    return '🌤️';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white min-w-80">
        <p className="text-sm opacity-80">Loading...</p>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl p-6 text-white min-w-80">
        <p className="text-sm">{error || 'Data cuaca tidak tersedia'}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white min-w-80 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{weather.kota}</h3>
        <span className="text-4xl">{getWeatherIcon(weather.kondisi)}</span>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-4xl font-bold">{weather.suhu}</p>
          <p className="text-blue-50 text-sm mt-1">{weather.kondisi}</p>
        </div>
        
        <button
          onClick={() => fetchWeather()}
          className="mt-4 w-full bg-white bg-opacity-20 hover:bg-opacity-30 transition py-2 px-4 rounded-lg text-sm font-medium"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
