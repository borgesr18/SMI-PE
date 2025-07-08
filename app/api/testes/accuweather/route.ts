import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ACCUWEATHER_API_KEY
    
    if (!apiKey) {
      return Response.json(
        { error: 'API key não configurada para AccuWeather' },
        { status: 500 }
      )
    }

    const city = 'Caruaru'
    
    const locationUrl = `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=${city}`
    
    const locationResponse = await fetch(locationUrl)
    
    if (!locationResponse.ok) {
      const errorData = await locationResponse.text()
      return Response.json(
        { 
          error: 'Erro ao buscar localização no AccuWeather',
          status: locationResponse.status,
          details: errorData
        },
        { status: locationResponse.status }
      )
    }

    const locationData = await locationResponse.json()
    
    if (!locationData || locationData.length === 0) {
      return Response.json(
        { error: 'Localização não encontrada no AccuWeather' },
        { status: 404 }
      )
    }

    const locationKey = locationData[0].Key
    
    const weatherUrl = `http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}&language=pt-br&details=true`
    
    const weatherResponse = await fetch(weatherUrl)
    
    if (!weatherResponse.ok) {
      const errorData = await weatherResponse.text()
      return Response.json(
        { 
          error: 'Erro ao buscar dados meteorológicos do AccuWeather',
          status: weatherResponse.status,
          details: errorData
        },
        { status: weatherResponse.status }
      )
    }

    const weatherData = await weatherResponse.json()
    
    return Response.json({
      source: 'AccuWeather',
      location: {
        city,
        locationKey,
        locationInfo: locationData[0]
      },
      timestamp: new Date().toISOString(),
      data: weatherData
    })

  } catch (error) {
    console.error('Erro na rota de teste AccuWeather:', error)
    return Response.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
