// lib/twilio.ts
import twilio from 'twilio'

const client = twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH_TOKEN!)
const from = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`

export async function enviarMensagemWhatsApp(to: string, message: string) {
  try {
    const numeroDestino = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`

    const resultado = await client.messages.create({
      body: message,
      from,
      to: numeroDestino,
    })

    return resultado // Retorna o objeto real da Twilio
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error)
    return null
  }
}
