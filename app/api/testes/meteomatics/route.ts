import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const username = process.env.METEOMATICS_USERNAME
    const password = process.env.METEOMATICS_PASSWORD
    
    if (!username || !password) {
      return Response.json(
        { error: 'Credenciais não configuradas para Meteomatics' },
        { status: 500 }
      )
    }

    const lat = -8.05
    const lon = -34.9
    const datetime = new Date().toISOString().split('.')[0] + 'Z'
    
    const url = `https://api.meteomatics.com/${datetime}/t_2m:C/${lat},${lon}/json`
    
    const auth = Buffer.from(`${username}:${password}`).toString('base64')

    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      return Response.json(
        { 
          error: 'Erro ao buscar dados do Meteomatics',
          status: response.status,
          details: errorData
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return Response.json({
      source: 'Meteomatics',
      location: { lat, lon },
      datetime,
      timestamp: new Date().toISOString(),
      data
    })

  } catch (error) {
    console.error('Erro na rota de teste Meteomatics:', error)
    return Response.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
