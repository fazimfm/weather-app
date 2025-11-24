import React, { useState } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [typedCity, setTypedCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const apiKey = '012757778d40110e74ee533affa83703';

  const popularCities = [
    '', 'Delhi', 'Chennai', 'Bangalore', 'Hyderabad',
    'Kolkata', 'Pune', 'Jaipur', 'Varanasi', 'Goa',
    'Shimla', 'Manali', 'Mysuru', 'Coimbatore'
  ];

   const formatTime = (ts) =>
  new Date(ts * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  // 5-Day Forecast Fetch
  const getForecast = async (cityName) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`
      );
      const data = await res.json();

      const daily = data.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );

      setForecast(daily);
    } catch (err) {
      console.log("Forecast Error:", err);
    }
  };

  const getWeather = async () => {
    const finalCity = city || typedCity;

    if (!finalCity.trim()) {
      setErrorMsg('❗ Please enter a city name.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setWeatherData(null);

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          finalCity
        )}&appid=${apiKey}&units=metric`
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'City not found');
      }

      const data = await res.json();
      setWeatherData(data);

      // Fetch forecast
      getForecast(finalCity);

    } catch (error) {
      setErrorMsg(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherImage = (main) => {
    switch (main.toLowerCase()) {
      case 'clear':
        return '/sunny.jpg';
      case 'clouds':
        return '/cloudy.jpg';
      case 'rain':
      case 'drizzle':
        return '/rainy.jpg';
      case 'snow':
        return '/snow.jpg';
      case 'thunderstorm':
        return '/stormy.jpg';
      case 'mist':
        return '/mist.jpg';
      case 'haze':
        return '/Haze.jpg';
      default:
        return '/sunny.jpg';
    }
  };

  return (
    <>
      <video autoPlay muted loop id="bg-video">
        <source src="/clip.mp4" type="video/mp4" />
      </video>

      <div className="weather-container">
        <h2>🌦 Weather App</h2>

        <div className="input-group">

          {/* Dropdown */}
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              if (e.target.value) getWeather();
            }}
          >
            {popularCities.map((place) => (
              <option key={place} value={place}>
                {place === '' ? '📍 Select City' : place}
              </option>
            ))}
          </select>

          {/* Text input */}
          <input
            type="text"
            value={typedCity}
            placeholder="Or type city name"
            onChange={(e) => setTypedCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && getWeather()}
            disabled={loading}
          />

          <button onClick={getWeather} disabled={loading}>
            {loading ? 'Loading...' : 'Get Weather'}
          </button>
        </div>

        {errorMsg && <p className="error">{errorMsg}</p>}
{weatherData && (
  <div className="weather-output">
    {/* LEFT – main info */}
    <div className="main-today">
      <p className="location">
        📍 {weatherData.name}, {weatherData.sys.country}
      </p>

      <img
        src={getWeatherImage(weatherData.weather[0].main)}
        alt={weatherData.weather[0].main}
        className="weather-icon"
      />

      <p className="big-temp">
        {Math.round(weatherData.main.temp)}°C
      </p>

      <p className="condition">
        {weatherData.weather[0].main} — {weatherData.weather[0].description}
      </p>
    </div>

    {/* RIGHT – advanced highlights */}
    <div className="today-grid">
      <div className="today-card">
        <span className="label">Feels like</span>
        <span className="value">
          {Math.round(weatherData.main.feels_like)}°C
        </span>
      </div>

      <div className="today-card">
        <span className="label">High / Low</span>
        <span className="value">
          {Math.round(weatherData.main.temp_max)}° /{' '}
          {Math.round(weatherData.main.temp_min)}°C
        </span>
      </div>

      <div className="today-card">
        <span className="label">Humidity</span>
        <span className="value">{weatherData.main.humidity}%</span>
      </div>

      <div className="today-card">
        <span className="label">Wind</span>
        <span className="value">{weatherData.wind.speed} m/s</span>
      </div>

      <div className="today-card">
        <span className="label">Sunrise</span>
        <span className="value">
          {formatTime(weatherData.sys.sunrise)}
        </span>
      </div>

      <div className="today-card">
        <span className="label">Sunset</span>
        <span className="value">
          {formatTime(weatherData.sys.sunset)}
        </span>
      </div>
    </div>
  </div>
)}
        {/* 5-Day Forecast */}
        {forecast.length > 0 && (
          <div className="forecast-box">
            <h3>📅 5-Day Forecast</h3>

            {/* RIGHT → LEFT */}
            <div className="forecast-row">
              {[...forecast].reverse().map((day) => (
                <div key={day.dt} className="forecast-item">
                  <p><strong>{new Date(day.dt_txt).toLocaleDateString()}</strong></p>
                  <p>{day.weather[0].main}</p>
                  <p>🌡 {Math.round(day.main.temp)}°C</p>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </>
  );
}

export default App;
