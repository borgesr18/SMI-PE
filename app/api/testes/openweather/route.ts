import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY
    
    if (!apiKey) {
      return Response.json(
        { error: 'API key não configurada para OpenWeatherMap' },
        { status: 500 }
      )
    }

    const lat = -8.05
    const lon = -34.9
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${apiKey}`

    const response = await fetch(url)
    
    if (!response.ok) {
      const errorData = await response.text()
      return Response.json(
        { 
          error: 'Erro ao buscar dados do OpenWeatherMap',
          status: response.status,
          details: errorData
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return Response.json({
      source: 'OpenWeatherMap OneCall API 3.0',
      location: { lat, lon },
      timestamp: new Date().toISOString(),
      data
    })

  } catch (error) {
    console.error('Erro na rota de teste OpenWeatherMap:', error)
    return Response.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
