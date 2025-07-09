// app/api/send-alerts/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import axios from 'axios'

export async function GET() {
  try {
    // Buscar todos os alertas ativos
    const alertas = await prisma.alerta.findMany({
      where: { ativo: true },
      include: {
        usuario: true,
        cidade: true
      }
    })

    const weatherApiKey = process.env.WEATHER_API_KEY
    const twilioSid = process.env.TWILIO_ACCOUNT_SID
    const twilioToken = process.env.TWILIO_AUTH_TOKEN
    const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER

    if (!weatherApiKey || !twilioSid || !twilioToken || !twilioNumber) {
      return NextResponse.json({ error: 'Variáveis de ambiente ausentes' }, { status: 500 })
    }

    for (const alerta of alertas) {
      const { latitude, longitude, nome: nomeCidade } = alerta.cidade
      const { telefone, nome: nomeUsuario } = alerta.usuario

      // Buscar previsão atual
      const weather = await axios.get('https://api.weatherapi.com/v1/current.json', {
        params: {
          key: weatherApiKey,
          q: `${latitude},${longitude}`,
          lang: 'pt'
        }
      })

      const previsao = weather.data.current
      const condicaoTexto = previsao.condition.text
      const chuva = previsao.precip_mm
      const temperatura = previsao.temp_c

      // Verificar se o alerta deve ser disparado
      let disparar = false
      if (alerta.tipo === 'chuva' && chuva >= alerta.valorGatilho) disparar = true
      if (alerta.tipo === 'temperatura' && temperatura >= alerta.valorGatilho) disparar = true
      // Aqui você pode adicionar mais tipos, como vento, etc.

      if (disparar) {
        const mensagem = `🌦️ Olá, ${nomeUsuario}!\n\nAlerta de *${alerta.tipo}* para *${nomeCidade}*:\n${condicaoTexto}\n🌡️ Temp: ${temperatura}°C\n☔ Chuva: ${chuva}mm`

        // Enviar via Twilio WhatsApp
        await axios.post(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, new URLSearchParams({
          To: `whatsapp:${telefone}`,
          From: `whatsapp:${twilioNumber}`,
          Body: mensagem
        }), {
          auth: {
            username: twilioSid,
            password: twilioToken
          }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao enviar alertas:', error)
    return NextResponse.json({ error: 'Erro ao enviar alertas' }, { status: 500 })
  }
}
