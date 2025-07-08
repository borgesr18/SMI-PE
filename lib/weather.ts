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
  private accuweatherKey = process.env.API_KEY_ACCUWEATHER || ''
  private weatherstackKey = process.env.API_KEY_WEATHERSTACK || ''

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

  async getFromMeteomatics(lat: number, lon: number, type: 'current' | 'hourly' | 'daily'): Promise<any> {
    const baseUrl = 'https://api.meteomatics.com'
    const username = process.env.METEOMATICS_USER
    const password = process.env.METEOMATICS_PASS

    const date = new Date()
    const isoDate = date.toISOString().split('.')[0] + 'Z'

    let parameter = 't_2m:C'
    if (type === 'hourly') parameter = 't_2m:C,precip_1h:mm,wind_speed_10m:ms'
    if (type === 'daily') parameter = 't_max_2m_24h:C,t_min_2m_24h:C,precip_24h:mm,wind_speed_10m:ms'

    const url = `${baseUrl}/${isoDate}/${parameter}/${lat},${lon}/json`
    const auth = Buffer.from(`${username}:${password}`).toString('base64')

    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    })

    const data = response.data

    if (type === 'current') {
      return {
        source: 'Meteomatics',
        temperature: data?.data?.[0]?.coordinates?.[0]?.dates?.[0]?.value || 0,
        condition: 'Desconhecido',
        timestamp: new Date().toISOString()
      }
    }

    return data
  }

  async getFromAccuWeather(lat: number, lon: number, type: 'current' | 'hourly' | 'daily'): Promise<any> {
    const locationUrl = `http://dataservice.accuweather.com/locations/v1/cities/geoposition/search`
    const locationResponse = await axios.get(locationUrl, {
      params: {
        apikey: this.accuweatherKey,
        q: `${lat},${lon}`
      }
    })

    const locationKey = locationResponse.data.Key
    if (!locationKey) throw new Error('Invalid location key from AccuWeather')

    let endpoint = ''
    if (type === 'current') endpoint = `currentconditions/v1/${locationKey}`
    if (type === 'hourly') endpoint = `forecasts/v1/hourly/12hour/${locationKey}`
    if (type === 'daily') endpoint = `forecasts/v1/daily/5day/${locationKey}`

    const forecastUrl = `http://dataservice.accuweather.com/${endpoint}`
    const response = await axios.get(forecastUrl, {
      params: {
        apikey: this.accuweatherKey,
        language: 'pt-br',
        metric: true
      }
    })

    return response.data
  }

  async getFromOpenWeatherMap(lat: number, lon: number, type: 'current' | 'hourly' | 'daily'): Promise<any> {
    try {
      switch (type) {
        case 'current':
          return await this.getCurrentWeather(lat, lon)
        case 'hourly':
          return await this.getHourlyForecast(lat, lon)
        case 'daily':
          return await this.getDailyForecast(lat, lon)
        default:
          throw new Error(`Invalid type: ${type}`)
      }
    } catch (error) {
      console.error('Error fetching OpenWeatherMap data:', error)
      throw error
    }
  }

  async getFromWeatherStack(lat: number, lon: number, type: 'current' | 'hourly' | 'daily'): Promise<any> {
    const url = `http://api.weatherstack.com/current`
    const response = await axios.get(url, {
      params: {
        access_key: this.weatherstackKey,
        query: `${lat},${lon}`,
        units: 'm',
        language: 'pt'
      }
    })

    if (type !== 'current') {
      console.warn(`WeatherStack only supports current weather, requested: ${type}`)
    }

    return response.data
  }
}

export const weatherService = new WeatherService()
