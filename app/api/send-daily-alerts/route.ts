import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import axios from 'axios'

export async function GET() {
  try {
    const weatherApiKey = process.env.WEATHER_API_KEY
    const twilioSid = process.env.TWILIO_ACCOUNT_SID
    const twilioToken = process.env.TWILIO_AUTH_TOKEN
    const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER

    if (!weatherApiKey || !twilioSid || !twilioToken || !twilioNumber) {
      return NextResponse.json({ error: 'Variáveis de ambiente ausentes' }, { status: 500 })
    }

    // Buscar todos os usuários com telefone e cidade vinculada
    const usuarios = await prisma.usuario.findMany({
      where: {
        telefone: { not: undefined },
        cidadeId: { not: undefined }
      },
      include: {
        cidade: true
      }
    })

    for (const usuario of usuarios) {
      const { nome, telefone, cidade } = usuario
      const { latitude, longitude, nome: nomeCidade } = cidade

      // Obter previsão
      const previsao = await axios.get('https://api.weatherapi.com/v1/current.json', {
        params: {
          key: weatherApiKey,
          q: `${latitude},${longitude}`,
          lang: 'pt'
        }
      })

      const clima = previsao.data.current
      const condicao = clima.condition.text
      const temperatura = clima.temp_c
      const chuva = clima.precip_mm

      const mensagem = `🌤️ Olá, ${nome}!\n\nPrevisão do dia em *${nomeCidade}*:\n${condicao}\n🌡️ ${temperatura}°C\n☔ ${chuva} mm de chuva\n\n📢 *Dica do dia:* Aproveite nossas promoções exclusivas! Responda com "SAIR" para parar de receber.`

      // Enviar via WhatsApp
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no envio diário:', error)
    return NextResponse.json({ error: 'Erro ao enviar alertas diários' }, { status: 500 })
  }
}
