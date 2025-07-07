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
  private apiKey: string
  private backupApiKey: string
  private baseUrl = 'https://api.openweathermap.org/data/2.5'
  private backupUrl = 'https://api.weatherapi.com/v1'

  constructor() {
    this.apiKey = process.env.API_KEY_WEATHER || ''
    this.backupApiKey = process.env.API_KEY_WEATHER_BACKUP || ''
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
          lang: 'pt_br'
        }
      })

      const data = response.data
      return {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        windDirection: data.wind.deg,
        pressure: data.main.pressure,
        uvIndex: 0, // UV index requires separate API call
        visibility: data.visibility / 1000, // Convert to km
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        rain: data.rain?.['1h'] || 0,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error fetching current weather:', error)
      return this.getCurrentWeatherBackup(lat, lon)
    }
  }

  private async getCurrentWeatherBackup(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(`${this.backupUrl}/current.json`, {
        params: {
          key: this.backupApiKey,
          q: `${lat},${lon}`,
          lang: 'pt'
        }
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
    } catch (error) {
      console.error('Error fetching backup weather data:', error)
      throw new Error('Unable to fetch weather data from any source')
    }
  }

  async getHourlyForecast(lat: number, lon: number): Promise<HourlyForecast[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
          lang: 'pt_br'
        }
      })

      return response.data.list.slice(0, 24).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        temperature: Math.round(item.main.temp),
        rain: item.rain?.['3h'] || 0,
        windSpeed: Math.round(item.wind.speed * 3.6),
        description: item.weather[0].description,
        icon: item.weather[0].icon
      }))
    } catch (error) {
      console.error('Error fetching hourly forecast:', error)
      return []
    }
  }

  async getDailyForecast(lat: number, lon: number): Promise<DailyForecast[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
          lang: 'pt_br'
        }
      })

      const dailyData: { [key: string]: any[] } = {}
      
      response.data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toDateString()
        if (!dailyData[date]) {
          dailyData[date] = []
        }
        dailyData[date].push(item)
      })

      return Object.entries(dailyData).slice(0, 7).map(([date, items]) => {
        const temps = items.map(item => item.main.temp)
        const rains = items.map(item => item.rain?.['3h'] || 0)
        const winds = items.map(item => item.wind.speed * 3.6)
        
        return {
          date: new Date(date).toLocaleDateString('pt-BR', { 
            weekday: 'short', 
            day: '2-digit', 
            month: '2-digit' 
          }),
          tempMin: Math.round(Math.min(...temps)),
          tempMax: Math.round(Math.max(...temps)),
          rain: Math.max(...rains),
          windSpeed: Math.round(Math.max(...winds)),
          description: items[0].weather[0].description,
          icon: items[0].weather[0].icon
        }
      })
    } catch (error) {
      console.error('Error fetching daily forecast:', error)
      return []
    }
  }
}

export const weatherService = new WeatherService()
