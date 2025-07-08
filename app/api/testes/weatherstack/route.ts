import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.WEATHERSTACK_API_KEY
    
    if (!apiKey) {
      return Response.json(
        { error: 'API key não configurada para WeatherStack' },
        { status: 500 }
      )
    }

    const city = 'Caruaru'
    const url = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${city}&units=m&language=pt`

    const response = await fetch(url)
    
    if (!response.ok) {
      const errorData = await response.text()
      return Response.json(
        { 
          error: 'Erro ao buscar dados do WeatherStack',
          status: response.status,
          details: errorData
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    if (data.error) {
      return Response.json(
        { 
          error: 'Erro retornado pela API WeatherStack',
          details: data.error
        },
        { status: 400 }
      )
    }
    
    return Response.json({
      source: 'WeatherStack',
      location: city,
      timestamp: new Date().toISOString(),
      data
    })

  } catch (error) {
    console.error('Erro na rota de teste WeatherStack:', error)
    return Response.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
