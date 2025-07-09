// lib/weatherService.ts
import axios from 'axios'

export async function getPrevisao(latitude: number, longitude: number) {
  try {
    const accessKey = process.env.WEATHERSTACK_API_KEY
    const response = await axios.get('http://api.weatherstack.com/current', {
      params: {
        access_key: accessKey,
        query: `${latitude},${longitude}`,
        units: 'm',
        language: 'pt',
      },
    })

    const data = response.data

    if (!data || !data.current) {
      throw new Error('Resposta inválida da API do WeatherStack')
    }

    return {
      temperatura: data.current.temperature,
      chuva: data.current.precip,
      descricao: data.current.weather_descriptions?.[0] || 'Sem descrição',
    }
  } catch (error) {
    console.error('Erro ao obter previsão do tempo:', error)
    return {
      temperatura: 'N/D',
      chuva: 0,
      descricao: 'Erro ao obter previsão',
    }
  }
}
