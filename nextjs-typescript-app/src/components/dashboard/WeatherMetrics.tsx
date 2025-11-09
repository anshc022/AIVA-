"use client";

import { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  precipitation: number;
  temp_max: number;
  temp_min: number;
  weather_code: number;
  source: string;
  timestamp: string;
  // Enhanced fields from backend
  feels_like?: number;
  temp_range?: number;
  comfort_index?: string;
  uv_risk?: string;
}

interface WeatherMetricsProps {
  latitude?: number;
  longitude?: number;
}

export function WeatherMetrics({ latitude, longitude }: WeatherMetricsProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather data when coordinates change
  useEffect(() => {
    if (latitude && longitude) {
      fetchWeatherData(latitude, longitude);
    } else {
      // For debugging: Add default coordinates if none provided
      console.log('No coordinates provided to WeatherMetrics');
      console.log('Latitude:', latitude, 'Longitude:', longitude);
    }
  }, [latitude, longitude]);

  const fetchWeatherData = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);

    console.log('Fetching weather data for:', lat, lon);

    try {
      // Call backend weather API
      const response = await fetch('http://localhost:5000/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon
        })
      });

      console.log('Weather API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Weather API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Weather API response data:', data);
      
      if (data.success && data.weather) {
        setWeatherData(data.weather);
      } else if (data.weather) {
        // Handle case where success flag might not be present
        setWeatherData(data.weather);
      } else {
        throw new Error(data.error || 'No weather data received');
      }

    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherDescription = (code: number): { icon: string; description: string } => {
    const weatherCodes: { [key: number]: { icon: string; description: string } } = {
      0: { icon: '☀️', description: 'Clear sky' },
      1: { icon: '🌤️', description: 'Mainly clear' },
      2: { icon: '⛅', description: 'Partly cloudy' },
      3: { icon: '☁️', description: 'Overcast' },
      45: { icon: '🌫️', description: 'Fog' },
      48: { icon: '🌫️', description: 'Depositing rime fog' },
      51: { icon: '🌦️', description: 'Light drizzle' },
      53: { icon: '🌦️', description: 'Moderate drizzle' },
      55: { icon: '🌧️', description: 'Dense drizzle' },
      61: { icon: '🌧️', description: 'Slight rain' },
      63: { icon: '🌧️', description: 'Moderate rain' },
      65: { icon: '🌧️', description: 'Heavy rain' },
      71: { icon: '🌨️', description: 'Slight snow' },
      73: { icon: '🌨️', description: 'Moderate snow' },
      75: { icon: '❄️', description: 'Heavy snow' },
      80: { icon: '🌦️', description: 'Slight rain showers' },
      81: { icon: '🌧️', description: 'Moderate rain showers' },
      82: { icon: '⛈️', description: 'Violent rain showers' },
      95: { icon: '⛈️', description: 'Thunderstorm' },
      96: { icon: '⛈️', description: 'Thunderstorm with hail' },
      99: { icon: '⛈️', description: 'Heavy thunderstorm with hail' }
    };

    return weatherCodes[code] || { icon: '🌡️', description: 'Unknown conditions' };
  };

  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const getTemperatureColor = (temp: number): string => {
    if (temp >= 35) return 'text-red-400';
    if (temp >= 25) return 'text-orange-400';
    if (temp >= 15) return 'text-yellow-400';
    if (temp >= 5) return 'text-green-400';
    if (temp >= -5) return 'text-blue-400';
    return 'text-purple-400';
  };

  const getHumidityColor = (humidity: number): string => {
    if (humidity >= 80) return 'text-blue-400';
    if (humidity >= 60) return 'text-green-400';
    if (humidity >= 40) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getWindSpeedColor = (speed: number): string => {
    if (speed >= 25) return 'text-red-400'; // Strong wind
    if (speed >= 15) return 'text-orange-400'; // Moderate wind
    if (speed >= 8) return 'text-yellow-400'; // Light wind
    return 'text-green-400'; // Calm
  };

  if (loading) {
    return (
      <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-700/40 rounded-xl p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-slate-300">Loading weather data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-950/80 backdrop-blur-sm border border-red-500/40 rounded-xl p-6">
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-medium text-red-400 mb-2">Weather Data Unavailable</h3>
          <p className="text-slate-300 text-sm">{error}</p>
          {latitude && longitude && (
            <button
              onClick={() => fetchWeatherData(latitude, longitude)}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-700/40 rounded-xl p-6">
        <div className="text-center text-slate-400">
          <div className="text-4xl mb-3">🌍</div>
          <p>Select a location to view weather metrics</p>
        </div>
      </div>
    );
  }

  const weather = getWeatherDescription(weatherData.weather_code);

  return (
    <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-700/40 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 border-b border-slate-700/40">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">{weather.icon}</span>
              Weather Metrics
            </h3>
            <p className="text-slate-300 text-sm">{weather.description}</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getTemperatureColor(weatherData.temperature)}`}>
              {weatherData.temperature.toFixed(1)}°C
            </div>
            <div className="text-xs text-slate-400">Current</div>
          </div>
        </div>
      </div>

      {/* Main Weather Grid */}
      <div className="p-6 space-y-6">
        {/* Temperature Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-lg p-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🌡️</div>
              <div className={`text-xl font-bold ${getTemperatureColor(weatherData.temperature)}`}>
                {weatherData.temperature.toFixed(1)}°C
              </div>
              <div className="text-sm text-slate-300">Current</div>
              <div className="text-xs text-slate-400 mt-1">
                {weatherData.comfort_index || 'N/A'}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-lg p-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🔥</div>
              <div className={`text-xl font-bold ${getTemperatureColor(weatherData.temp_max)}`}>
                {weatherData.temp_max.toFixed(1)}°C
              </div>
              <div className="text-sm text-slate-300">Max Today</div>
              <div className="text-xs text-slate-400 mt-1">
                Range: {weatherData.temp_range?.toFixed(1) || 'N/A'}°C
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-lg p-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🧊</div>
              <div className={`text-xl font-bold ${getTemperatureColor(weatherData.temp_min)}`}>
                {weatherData.temp_min.toFixed(1)}°C
              </div>
              <div className="text-sm text-slate-300">Min Today</div>
              <div className="text-xs text-slate-400 mt-1">
                Feels: {weatherData.feels_like?.toFixed(1) || weatherData.temperature.toFixed(1)}°C
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="text-center">
              <div className="text-3xl mb-2">☀️</div>
              <div className="text-xl font-bold text-yellow-400">
                {weatherData.uv_risk || 'Moderate'}
              </div>
              <div className="text-sm text-slate-300">UV Risk</div>
              <div className="text-xs text-slate-400 mt-1">
                Protection advised
              </div>
            </div>
          </div>
        </div>

        {/* Atmospheric Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-600/20 to-green-600/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl mb-2">💧</div>
                <div className="text-sm text-slate-300">Humidity</div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getHumidityColor(weatherData.humidity || 0)}`}>
                  {weatherData.humidity ? `${weatherData.humidity.toFixed(0)}%` : 'N/A'}
                </div>
                {weatherData.humidity && (
                  <div className="w-24 bg-slate-700 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${getHumidityColor(weatherData.humidity).replace('text-', 'bg-')}`}
                      style={{ width: `${weatherData.humidity}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl mb-2">🌧️</div>
                <div className="text-sm text-slate-300">Precipitation</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-400">
                  {weatherData.precipitation.toFixed(1)} mm
                </div>
                <div className="text-xs text-slate-400">Today</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm text-slate-300">Pressure Trend</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-indigo-400">
                  {weatherData.humidity && weatherData.humidity > 70 ? 'Low' : 
                   weatherData.humidity && weatherData.humidity < 40 ? 'High' : 'Normal'}
                </div>
                <div className="text-xs text-slate-400">
                  {weatherData.humidity && weatherData.humidity > 70 ? 'Rain likely' : 
                   weatherData.humidity && weatherData.humidity < 40 ? 'Dry air' : 'Stable'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wind Information */}
        <div className="bg-gradient-to-br from-gray-600/20 to-slate-600/20 border border-gray-500/30 rounded-lg p-4">
          <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
            <span className="text-xl">💨</span>
            Wind Conditions
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300">Wind Speed</div>
                <div className={`text-xl font-bold ${getWindSpeedColor(weatherData.wind_speed)}`}>
                  {weatherData.wind_speed.toFixed(1)} km/h
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-300">Beaufort Scale</div>
                <div className="text-lg font-medium text-gray-300">
                  {weatherData.wind_speed < 1 ? 'Calm' :
                   weatherData.wind_speed < 6 ? 'Light Air' :
                   weatherData.wind_speed < 12 ? 'Light Breeze' :
                   weatherData.wind_speed < 20 ? 'Gentle Breeze' :
                   weatherData.wind_speed < 29 ? 'Moderate Breeze' :
                   weatherData.wind_speed < 39 ? 'Fresh Breeze' :
                   weatherData.wind_speed < 50 ? 'Strong Breeze' : 'Strong Wind'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300">Direction</div>
                <div className="text-xl font-bold text-gray-300">
                  {getWindDirection(weatherData.wind_direction)} ({weatherData.wind_direction.toFixed(0)}°)
                </div>
              </div>
              <div className="text-right">
                <div className="w-12 h-12 border-2 border-gray-400 rounded-full flex items-center justify-center relative">
                  <div 
                    className="absolute w-1 h-4 bg-red-400 origin-bottom"
                    style={{ 
                      transform: `rotate(${weatherData.wind_direction}deg) translateY(-8px)`,
                      borderRadius: '1px'
                    }}
                  ></div>
                  <div className="text-xs text-gray-300 font-bold">N</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Source */}
        <div className="bg-slate-800/30 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="text-slate-400">
              Data Source: <span className="text-green-400 font-medium">{weatherData.source}</span>
            </div>
            <div className="text-slate-400">
              Updated: {new Date(weatherData.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}