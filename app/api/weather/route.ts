import { NextResponse } from 'next/server'
import { weatherService } from '@/lib/weather'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lon = parseFloat(searchParams.get('lon') || '0')
    const type = (searchParams.get('type') || 'current').toLowerCase()
    const source = (searchParams.get('source') || 'openweathermap').toLowerCase()

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    let data

    switch (source) {
      case 'meteomatics':
        data = await weatherService.getFromMeteomatics(lat, lon, type as 'current' | 'hourly' | 'daily')
        break

      case 'openweathermap':
        data = await weatherService.getFromOpenWeatherMap(lat, lon, type as 'current' | 'hourly' | 'daily')
        break

      case 'accuweather':
        data = await weatherService.getFromAccuWeather(lat, lon, type as 'current' | 'hourly' | 'daily')
        break

      case 'weatherstack':
        data = await weatherService.getFromWeatherStack(lat, lon, type as 'current' | 'hourly' | 'daily')
        break

      default:
        return NextResponse.json(
          { error: 'Invalid source specified' },
          { status: 400 }
        )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching weather data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}
