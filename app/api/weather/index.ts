import { NextResponse } from 'next/server'
import { weatherService } from '@/lib/weather'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lon = parseFloat(searchParams.get('lon') || '0')
    const type = searchParams.get('type') || 'current'
    const source = searchParams.get('source') || 'meteomatics' // Default para Meteomatics

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    let data

    switch (source.toLowerCase()) {
      case 'meteomatics':
        data = await weatherService.getFromMeteomatics(lat, lon, type)
        break
      case 'openweathermap':
        data = await weatherService.getFromOpenWeatherMap(lat, lon, type)
        break
      case 'accuweather':
        data = await weatherService.getFromAccuWeather(lat, lon, type)
        break
      case 'weatherstack':
        data = await weatherService.getFromWeatherStack(lat, lon)
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
