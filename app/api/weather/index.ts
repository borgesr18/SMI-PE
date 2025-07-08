import { getWeatherFromMeteomatics } from './meteomatics'
// import outros como OpenWeather, AccuWeather, etc

export async function getPrimaryWeatherData() {
  const lat = -8.2838
  const lon = -35.9753

  const meteomaticsData = await getWeatherFromMeteomatics(lat, lon)

  return meteomaticsData
}
