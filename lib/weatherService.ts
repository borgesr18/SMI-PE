// lib/weatherService.ts
import axios from 'axios';

export async function getPrevisao(latitude: number, longitude: number) {
  const accessKey = process.env.WEATHERSTACK_API_KEY;
  const response = await axios.get('http://api.weatherstack.com/current', {
    params: {
      access_key: accessKey,
      query: `${latitude},${longitude}`,
      units: 'm',
      language: 'pt',
    },
  });

  const data = response.data;
  if (!data || !data.current) {
    throw new Error('Falha ao obter dados climáticos');
  }

  return {
    temperatura: data.current.temperature,
    chuva: data.current.precip,
    descricao: data.current.weather_descriptions[0],
  };
}
