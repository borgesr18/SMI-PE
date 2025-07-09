// lib/twilio.ts
import twilio from 'twilio'

const client = twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH_TOKEN!)
const from = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`

export async function enviarMensagemWhatsApp(to: string, message: string): Promise<boolean> {
  try {
    const numeroDestino = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`

    await client.messages.create({
      body: message,
      from,
      to: numeroDestino,
    })

    return true
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error)
    return false
  }
}
