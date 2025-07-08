// lib/weather/forecast.ts
import axios from 'axios';

interface ForecastResponse {
  source: string;
  temperature: number | null;
  condition: string;
  precipitation?: number;
  timestamp: string;
}

// API KEYS via .env
const METEOMATICS_USER = process.env.METEOMATICS_USER;
const METEOMATICS_PASS = process.env.METEOMATICS_PASS;
const ACCUWEATHER_API_KEY = process.env.ACCUWEATHER_API_KEY;
const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const WEATHERSTACK_API_KEY = process.env.WEATHERSTACK_API_KEY;

// LOCALIZAÇÃO (ex: Caruaru)
const LAT = -8.2846;
const LON = -35.9699;
const CITY = 'Caruaru';

export async function getForecastWithFallback(): Promise<ForecastResponse> {
  const timestamp = new Date().toISOString();

  try {
    // 🥇 Meteomatics
    const date = new Date().toISOString().split('T')[0];
    const url = `https://api.meteomatics.com/${date}T00:00:00Z/t_2m:C/${LAT},${LON}/json`;
    const auth = { username: METEOMATICS_USER!, password: METEOMATICS_PASS! };
    const res = await axios.get(url, { auth });
    const value = res.data.data[0].coordinates[0].dates[0].value;

    return {
      source: 'Meteomatics',
      temperature: value,
      condition: 'Desconhecido',
      timestamp
    };
  } catch (err) {
    console.warn('⚠ Meteomatics falhou, tentando AccuWeather...');
  }

  try {
    // 🥈 AccuWeather (uso básico de Core Weather)
    const locationUrl = `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${ACCUWEATHER_API_KEY}&q=${CITY}`;
    const locRes = await axios.get(locationUrl);
    const locationKey = locRes.data[0].Key;

    const forecastUrl = `http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${ACCUWEATHER_API_KEY}&language=pt-br&details=true`;
    const forecastRes = await axios.get(forecastUrl);
    const data = forecastRes.data[0];

    return {
      source: 'AccuWeather',
      temperature: data.Temperature.Metric.Value,
      condition: data.WeatherText,
      timestamp
    };
  } catch (err) {
    console.warn('⚠ AccuWeather falhou, tentando OpenWeatherMap...');
  }

  try {
    // 🥉 OpenWeatherMap
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
    const res = await axios.get(url);
    const data = res.data;

    return {
      source: 'OpenWeatherMap',
      temperature: data.main.temp,
      condition: data.weather[0].description,
      timestamp
    };
  } catch (err) {
    console.warn('⚠ OpenWeatherMap falhou, tentando WeatherStack...');
  }

  try {
    // 4º WeatherStack (fallback final)
    const url = `http://api.weatherstack.com/current?access_key=${WEATHERSTACK_API_KEY}&query=${CITY}&units=m&language=pt`;
    const res = await axios.get(url);
    const data = res.data;

    return {
      source: 'WeatherStack',
      temperature: data.current.temperature,
      condition: data.current.weather_descriptions[0],
      timestamp
    };
  } catch (err) {
    console.error('❌ Nenhuma fonte de clima disponível.');
    throw new Error('Todas as fontes de clima falharam.');
  }
}
