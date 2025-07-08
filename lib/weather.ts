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
  source?: string
}

export interface HourlyForecast {
  time: string
  temperature: number
  rain: number
  windSpeed: number
  description: string
  icon: string
}

export interface DailyForecast {
  date: string
  tempMin: number
  tempMax: number
  rain: number
  windSpeed: number
  description: string
  icon: string
}

export class WeatherService {
  private apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY || ''
  private backupApiKey = process.env.API_KEY_WEATHER_BACKUP || ''
  private openWeatherUrl = 'https://api.openweathermap.org/data/2.5'
  private backupUrl = 'https://api.weatherapi.com/v1'
  private meteomaticsUrl = process.env.METEOMATICS_BASE_URL || ''
  private meteomaticsUser = process.env.METEOMATICS_USERNAME || ''
  private meteomaticsPass = process.env.METEOMATICS_PASSWORD || ''
  private accuKey = process.env.ACCUWEATHER_API_KEY || ''
  private weatherStackUrl = process.env.WEATHERSTACK_API_URL || ''
  private weatherStackKey = process.env.WEATHERSTACK_API_KEY || ''

  async getCurrentWeather(lat: number, lon: number, source: string = 'openweathermap'): Promise<WeatherData> {
    switch (source) {
      case 'meteomatics':
        return this.getFromMeteomatics(lat, lon)
      case 'accuweather':
        return this.getFromAccuWeather(lat, lon)
      case 'weatherstack':
        return this.getFromWeatherStack(lat, lon)
      case 'openweathermap':
      default:
        return this.getFromOpenWeather(lat, lon)
    }
  }

  private async getFromOpenWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(`${this.openWeatherUrl}/weather`, {
        params: { lat, lon, appid: this.apiKey, units: 'metric', lang: 'pt_br' }
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
        timestamp: new Date(),
        source: 'OpenWeatherMap'
      }
    } catch (error) {
      console.error('Erro OpenWeather:', error)
      return this.getCurrentWeatherBackup(lat, lon)
    }
  }

  private async getCurrentWeatherBackup(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(`${this.backupUrl}/current.json`, {
        params: { key: this.backupApiKey, q: `${lat},${lon}`, lang: 'pt' }
      })
      const data = response.data.current
      return {
        temperature: Math.round(data.temp_c),
        humidity: data.humidity,
        windSpeed: Math.round(data.wind_kph),
        windDirection: data.wind_degree,
        pressure: data.pressure_mb,
        uvIndex: data.uv,
        visibility: data.vis_km,
        description: data.condition.text,
        icon: data.condition.icon,
        rain: data.precip_mm || 0,
        timestamp: new Date(),
        source: 'WeatherAPI (Backup)'
      }
    } catch (error) {
      console.error('Erro WeatherAPI (Backup):', error)
      throw new Error('Unable to fetch weather data from any source')
    }
  }

  private async getFromMeteomatics(lat: number, lon: number): Promise<WeatherData> {
    const now = new Date().toISOString().split('.')[0] + 'Z'
    const url = `${this.meteomaticsUrl}/${now}/t_2m:C/${lat},${lon}/json`

    try {
      const response = await axios.get(url, {
        auth: { username: this.meteomaticsUser, password: this.meteomaticsPass }
      })
      const temp = response.data?.data?.[0]?.coordinates?.[0]?.dates?.[0]?.value || 0
      return {
        temperature: Math.round(temp),
        humidity: 0,
        windSpeed: 0,
        windDirection: 0,
        pressure: 0,
        uvIndex: 0,
        visibility: 0,
        description: 'Desconhecido',
        icon: '',
        timestamp: new Date(),
        source: 'Meteomatics'
      }
    } catch (error) {
      console.error('Erro Meteomatics:', error)
      throw new Error('Erro ao consultar Meteomatics')
    }
  }

  private async getFromAccuWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const locationRes = await axios.get('http://dataservice.accuweather.com/locations/v1/cities/geoposition/search', {
        params: { apikey: this.accuKey, q: `${lat},${lon}` }
      })
      const locationKey = locationRes.data.Key

      const weatherRes = await axios.get(`http://dataservice.accuweather.com/currentconditions/v1/${locationKey}`, {
        params: { apikey: this.accuKey, details: true }
      })
      const data = weatherRes.data[0]

      return {
        temperature: Math.round(data.Temperature.Metric.Value),
        humidity: data.RelativeHumidity,
        windSpeed: Math.round(data.Wind.Speed.Metric.Value),
        windDirection: data.Wind.Direction.Degrees,
        pressure: data.Pressure.Metric.Value,
        uvIndex: data.UVIndex,
        visibility: data.Visibility.Metric.Value,
        description: data.WeatherText,
        icon: `https://developer.accuweather.com/sites/default/files/${String(data.WeatherIcon).padStart(2, '0')}-s.png`,
        rain: data.Precip1hr?.Metric?.Value || 0,
        timestamp: new Date(),
        source: 'AccuWeather'
      }
    } catch (error) {
      console.error('Erro AccuWeather:', error)
      throw new Error('Erro ao consultar AccuWeather')
    }
  }

  private async getFromWeatherStack(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(this.weatherStackUrl, {
        params: {
          access_key: this.weatherStackKey,
          query: `${lat},${lon}`,
          units: 'm',
          language: 'pt'
        }
      })
      const data = response.data.current
      return {
        temperature: data.temperature,
        humidity: data.humidity,
        windSpeed: data.wind_speed,
        windDirection: data.wind_degree,
        pressure: data.pressure,
        uvIndex: data.uv_index || 0,
        visibility: data.visibility,
        description: data.weather_descriptions[0],
        icon: data.weather_icons[0],
        rain: data.precip,
        timestamp: new Date(),
        source: 'WeatherStack'
      }
    } catch (error) {
      console.error('Erro WeatherStack:', error)
      throw new Error('Erro ao consultar WeatherStack')
    }
  }
}

export const weatherService = new WeatherService()

