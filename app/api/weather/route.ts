import { NextResponse } from 'next/server'
import { weatherService } from '@/lib/weather'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lon = parseFloat(searchParams.get('lon') || '0')
    const type = searchParams.get('type') || 'current'

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    let data
    switch (type) {
      case 'current':
        data = await weatherService.getCurrentWeather(lat, lon)
        break
      case 'hourly':
        data = await weatherService.getHourlyForecast(lat, lon)
        break
      case 'daily':
        data = await weatherService.getDailyForecast(lat, lon)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid weather type' },
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
