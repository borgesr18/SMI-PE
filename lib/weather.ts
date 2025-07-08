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
  private apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY || ''
  private backupApiKey = process.env.API_KEY_WEATHER_BACKUP || ''
  private accuWeatherKey = process.env.ACCUWEATHER_API_KEY || ''
  private baseUrl = 'https://api.openweathermap.org/data/2.5'
  private backupUrl = 'https://api.weatherapi.com/v1'

  async getCurrentWeather(lat: number, lon: number, source: string = 'openweathermap'): Promise<WeatherData> {
    switch (source) {
      case 'accuweather':
        return this.getCurrentWeatherFromAccuWeather(lat, lon)
      case 'openweathermap':
      default:
        return this.getCurrentWeatherFromOpenWeatherMap(lat, lon)
    }
  }

  private async getCurrentWeatherFromOpenWeatherMap(lat: number, lon: number): Promise<WeatherData> {
    try {
      const res = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
          lang: 'pt_br'
        }
      })

      const data = res.data
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
    } catch (err) {
      console.error('Erro OpenWeatherMap:', err)
      return this.getCurrentWeatherBackup(lat, lon)
    }
  }

  private async getCurrentWeatherBackup(lat: number, lon: number): Promise<WeatherData> {
    try {
      const res = await axios.get(`${this.backupUrl}/current.json`, {
        params: {
          key: this.backupApiKey,
          q: `${lat},${lon}`,
          lang: 'pt'
        }
      })

      const data = res.data.current
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
    } catch (err) {
      console.error('Erro WeatherAPI Backup:', err)
      throw new Error('Falha ao obter dados meteorológicos de todas as fontes.')
    }
  }

  private async getLocationKeyFromAccuWeather(lat: number, lon: number): Promise<string> {
    const url = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search`
    const res = await axios.get(url, {
      params: {
        apikey: this.accuWeatherKey,
        q: `${lat},${lon}`,
        language: 'pt-br'
      }
    })

    return res.data?.Key
  }

  private async getCurrentWeatherFromAccuWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const locationKey = await this.getLocationKeyFromAccuWeather(lat, lon)
      const url = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}`
      const res = await axios.get(url, {
        params: {
          apikey: this.accuWeatherKey,
          language: 'pt-br',
          details: true
        }
      })

      const data = res.data[0]
      return {
        temperature: Math.round(data.Temperature.Metric.Value),
        humidity: data.RelativeHumidity,
        windSpeed: Math.round(data.Wind.Speed.Metric.Value),
        windDirection: data.Wind.Direction.Degrees,
        pressure: data.Pressure.Metric.Value,
        uvIndex: data.UVIndex,
        visibility: data.Visibility.Metric.Value,
        description: data.WeatherText,
        icon: String(data.WeatherIcon).padStart(2, '0'),
        rain: data.Precip1hr?.Metric?.Value || 0,
        timestamp: new Date()
      }
    } catch (err) {
      console.error('Erro AccuWeather:', err)
      throw new Error('Erro ao obter clima do AccuWeather.')
    }
  }
}

export const weatherService = new WeatherService()

}

export const weatherService = new WeatherService()

