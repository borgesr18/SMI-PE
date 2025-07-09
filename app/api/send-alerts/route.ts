// app/api/send-alerts/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import axios from 'axios'

export async function GET() {
  try {
    // 1. Buscar todos os alertas ativos
    const alertas = await prisma.alerta.findMany({
      where: { ativo: true },
      include: {
        usuario: true,
        cidade: true
      }
    })

    // 2. Iterar sobre alertas
    for (const alerta of alertas) {
      const { latitude, longitude } = alerta.cidade

      // 3. Buscar previsão atual (ex: WeatherAPI)
      const response = await axios.get(`https://api.weatherapi.com/v1/current.json`, {
        params: {
          key: process.env.WEATHER_API_KEY,
          q: `${latitude},${longitude}`,
          lang: 'pt'
        }
      })

      const previsao = response.data.current

      // 4. Verificar se a previsão atende ao alerta
      let condicao = false
      if (alerta.tipo === 'chuva') condicao = previsao.precip_mm >= alerta.valorGatilho
      if (alerta.tipo === 'temperatura') condicao = previsao.temp_c >= alerta.valorGatilho

      if (condicao) {
        // 5. Enviar mensagem via WhatsApp (Twilio ou outro)
        await axios.post('https://api.twilio.com/YOUR_ENDPOINT', {
          to: `whatsapp:${alerta.usuario.telefone}`,
          body: `🌦️ Alerta de ${alerta.tipo} para ${alerta.cidade.nome}: ${previsao.condition.text}`
        }, {
          auth: {
            username: process.env.TWILIO_ACCOUNT_SID!,
            password: process.env.TWILIO_AUTH_TOKEN!
          }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao enviar alertas' }, { status: 500 })
  }
}
