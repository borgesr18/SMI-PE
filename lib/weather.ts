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
  private apiKey = process.env.API_KEY_WEATHER || ''
  private backupApiKey = process.env.API_KEY_WEATHER_BACKUP || ''
  private accuWeatherApiKey = process.env.ACCUWEATHER_API_KEY || ''
  private weatherStackApiKey = process.env.WEATHERSTACK_API_KEY || ''
  private meteomaticsUser = process.env.METEOMATICS_USER || ''
  private meteomaticsPass = process.env.METEOMATICS_PASS || ''

  private baseUrl = 'https://api.openweathermap.org/data/2.5'
  private backupUrl = 'https://api.weatherapi.com/v1'

  async getCurrentWeather(lat: number, lon: number, source = 'openweathermap'): Promise<WeatherData> {
    switch (source) {
      case 'openweathermap':
        return this.getCurrentWeatherOpenWeather(lat, lon)
      case 'accuweather':
        return this.getCurrentWeatherAccuWeather(lat, lon)
      case 'weatherstack':
        return this.getCurrentWeatherWeatherStack(lat, lon)
      case 'meteomatics':
        return this.getCurrentWeatherMeteomatics(lat, lon)
      default:
        return this.getCurrentWeatherOpenWeather(lat, lon)
    }
  }

  async getHourlyForecast(lat: number, lon: number, source = 'openweathermap'): Promise<HourlyForecast[]> {
    switch (source) {
      case 'openweathermap':
        return this.getHourlyForecastOpenWeather(lat, lon)
      case 'accuweather':
        return this.getHourlyForecastAccuWeather(lat, lon)
      case 'meteomatics':
        return this.getHourlyForecastMeteomatics(lat, lon)
      default:
        return []
    }
  }

  async getDailyForecast(lat: number, lon: number, source = 'openweathermap'): Promise<DailyForecast[]> {
    switch (source) {
      case 'openweathermap':
        return this.getDailyForecastOpenWeather(lat, lon)
      case 'accuweather':
        return this.getDailyForecastAccuWeather(lat, lon)
      case 'meteomatics':
        return this.getDailyForecastMeteomatics(lat, lon)
      default:
        return []
    }
  }

  // ---------------------------- OPENWEATHER ---------------------------

  private async getCurrentWeatherOpenWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
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
        timestamp: new Date()
      }
    } catch (error) {
      console.error('OpenWeather error:', error)
      return this.getCurrentWeatherBackup(lat, lon)
    }
  }

  private async getHourlyForecastOpenWeather(lat: number, lon: number): Promise<HourlyForecast[]> {
    const response = await axios.get(`${this.baseUrl}/forecast`, {
      params: { lat, lon, appid: this.apiKey, units: 'metric', lang: 'pt_br' }
    })
    return response.data.list.slice(0, 24).map((item: any) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      temperature: Math.round(item.main.temp),
      rain: item.rain?.['3h'] || 0,
      windSpeed: Math.round(item.wind.speed * 3.6),
      description: item.weather[0].description,
      icon: item.weather[0].icon
    }))
  }

  private async getDailyForecastOpenWeather(lat: number, lon: number): Promise<DailyForecast[]> {
    const response = await axios.get(`${this.baseUrl}/forecast`, {
      params: { lat, lon, appid: this.apiKey, units: 'metric', lang: 'pt_br' }
    })
    const dailyData: { [key: string]: any[] } = {}
    response.data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toDateString()
      if (!dailyData[date]) dailyData[date] = []
      dailyData[date].push(item)
    })
    return Object.entries(dailyData).slice(0, 7).map(([date, items]) => {
      const temps = items.map(item => item.main.temp)
      const rains = items.map(item => item.rain?.['3h'] || 0)
      const winds = items.map(item => item.wind.speed * 3.6)
      return {
        date: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
        tempMin: Math.round(Math.min(...temps)),
        tempMax: Math.round(Math.max(...temps)),
        rain: Math.max(...rains),
        windSpeed: Math.round(Math.max(...winds)),
        description: items[0].weather[0].description,
        icon: items[0].weather[0].icon
      }
    })
  }

  private async getCurrentWeatherBackup(lat: number, lon: number): Promise<WeatherData> {
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
      timestamp: new Date()
    }
  }

  // ---------------------------- PLACEHOLDERS --------------------------

  private async getCurrentWeatherAccuWeather(lat: number, lon: number): Promise<WeatherData> {
    throw new Error('AccuWeather current weather not implemented')
  }

  private async getCurrentWeatherWeatherStack(lat: number, lon: number): Promise<WeatherData> {
    throw new Error('WeatherStack current weather not implemented')
  }

  private async getCurrentWeatherMeteomatics(lat: number, lon: number): Promise<WeatherData> {
    throw new Error('Meteomatics current weather not implemented')
  }

  private async getHourlyForecastAccuWeather(lat: number, lon: number): Promise<HourlyForecast[]> {
    throw new Error('AccuWeather hourly not implemented')
  }

  private async getDailyForecastAccuWeather(lat: number, lon: number): Promise<DailyForecast[]> {
    throw new Error('AccuWeather daily not implemented')
  }

  private async getHourlyForecastMeteomatics(lat: number, lon: number): Promise<HourlyForecast[]> {
    throw new Error('Meteomatics hourly not implemented')
  }

  private async getDailyForecastMeteomatics(lat: number, lon: number): Promise<DailyForecast[]> {
    throw new Error('Meteomatics daily not implemented')
  }
}

export const weatherService = new WeatherService()

