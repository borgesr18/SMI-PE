import axios from 'axios'

export interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: number
  pressure: number
  uvIndex: number
  visibility: number
  description: string
  icon: string
  rain?: number
  timestamp: Date
}

export class WeatherService {
  async getCurrentWeather(lat: number, lon: number, source = 'openweathermap'): Promise<WeatherData> {
    switch (source.toLowerCase()) {
      case 'meteomatics':
        return this.getCurrentWeatherFromMeteomatics(lat, lon)
      case 'accuweather':
        return this.getCurrentWeatherFromAccuWeather(lat, lon)
      case 'weatherstack':
        return this.getCurrentWeatherFromWeatherStack(lat, lon)
      default:
        return this.getCurrentWeatherFromOpenWeatherMap(lat, lon)
    }
  }

  private async getCurrentWeatherFromOpenWeatherMap(lat: number, lon: number): Promise<WeatherData> {
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY || ''
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { lat, lon, appid: apiKey, units: 'metric', lang: 'pt_br' }
    })
    const data = response.data
    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
      windDirection: data.wind.deg,
      pressure: data.main.pressure,
      uvIndex: 0,
      visibility: data.visibility / 1000,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      rain: data.rain?.['1h'] || 0,
      timestamp: new Date()
    }
  }

  private async getCurrentWeatherFromWeatherStack(lat: number, lon: number): Promise<WeatherData> {
    const apiKey = process.env.WEATHERSTACK_API_KEY || ''
    const response = await axios.get('http://api.weatherstack.com/current', {
      params: { access_key: apiKey, query: `${lat},${lon}` }
    })
    const data = response.data.current
    return {
      temperature: data.temperature,
      humidity: data.humidity,
      windSpeed: data.wind_speed,
      windDirection: data.wind_degree,
      pressure: data.pressure,
      uvIndex: data.uv_index,
      visibility: data.visibility,
      description: data.weather_descriptions[0],
      icon: '',
      rain: data.precip,
      timestamp: new Date()
    }
  }

  private async getCurrentWeatherFromMeteomatics(lat: number, lon: number): Promise<WeatherData> {
    const username = process.env.METEOMATICS_USERNAME
    const password = process.env.METEOMATICS_PASSWORD
    const now = new Date().toISOString().split('.')[0] + 'Z'
    const url = `https://api.meteomatics.com/${now}/t_2m:C/${lat},${lon}/json`
    const response = await axios.get(url, {
      auth: { username: username || '', password: password || '' }
    })
    const temp = response.data.data[0]?.coordinates[0]?.dates[0]?.value || 0
    return {
      temperature: temp,
      humidity: 0,
      windSpeed: 0,
      windDirection: 0,
      pressure: 0,
      uvIndex: 0,
      visibility: 0,
      description: 'Desconhecido',
      icon: '',
      timestamp: new Date()
    }
  }

  private async getCurrentWeatherFromAccuWeather(lat: number, lon: number): Promise<WeatherData> {
    const apiKey = process.env.ACCUWEATHER_API_KEY || ''
    const locationResp = await axios.get(`http://dataservice.accuweather.com/locations/v1/cities/geoposition/search`, {
      params: { apikey: apiKey, q: `${lat},${lon}` }
    })
    const locationKey = locationResp.data.Key

    const response = await axios.get(`http://dataservice.accuweather.com/currentconditions/v1/${locationKey}`, {
      params: { apikey: apiKey, language: 'pt-br', details: true }
    })
    const data = response.data[0]
    return {
      temperature: data.Temperature.Metric.Value,
      humidity: data.RelativeHumidity,
      windSpeed: data.Wind.Speed.Metric.Value,
      windDirection: data.Wind.Direction.Degrees,
      pressure: data.Pressure.Metric.Value,
      uvIndex: data.UVIndex,
      visibility: data.Visibility.Metric.Value,
      description: data.WeatherText,
      icon: '',
      rain: data.Precip1hr?.Metric?.Value || 0,
      timestamp: new Date(data.LocalObservationDateTime)
    }
  }
}

export const weatherService = new WeatherService()


}

export const weatherService = new WeatherService()

