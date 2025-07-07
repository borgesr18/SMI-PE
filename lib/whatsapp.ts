import axios from 'axios'

export interface WhatsAppMessage {
  to: string
  message: string
  type: 'ALERTA' | 'PROPAGANDA'
}

export class WhatsAppService {
  private accountSid: string
  private authToken: string
  private phoneNumber: string

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || ''
    this.authToken = process.env.TWILIO_AUTH_TOKEN || ''
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || ''
  }

  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 WhatsApp Message (SIMULATED):')
        console.log(`To: ${message.to}`)
        console.log(`Type: ${message.type}`)
        console.log(`Message: ${message.message}`)
        console.log('---')
        return true
      }

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        new URLSearchParams({
          From: `whatsapp:${this.phoneNumber}`,
          To: `whatsapp:${message.to}`,
          Body: message.message
        }),
        {
          auth: {
            username: this.accountSid,
            password: this.authToken
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      return response.status === 201
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      return false
    }
  }

  formatAlertMessage(
    userName: string,
    cityName: string,
    alertType: string,
    value: number,
    threshold: number
  ): string {
    const alertMessages = {
      CHUVA: `🌧️ *ALERTA DE CHUVA* 🌧️\n\nOlá ${userName}!\n\nDetectamos chuva intensa em ${cityName}:\n• Precipitação atual: ${value}mm/h\n• Seu limite: ${threshold}mm/h\n\n⚠️ Tome cuidado ao sair de casa!\n\n_SMI-PE - Sistema Meteorológico Inteligente_`,
      VENTO: `💨 *ALERTA DE VENTO* 💨\n\nOlá ${userName}!\n\nVentos fortes detectados em ${cityName}:\n• Velocidade atual: ${value}km/h\n• Seu limite: ${threshold}km/h\n\n⚠️ Cuidado com objetos soltos!\n\n_SMI-PE - Sistema Meteorológico Inteligente_`,
      TEMPERATURA: `🌡️ *ALERTA DE TEMPERATURA* 🌡️\n\nOlá ${userName}!\n\nTemperatura elevada em ${cityName}:\n• Temperatura atual: ${value}°C\n• Seu limite: ${threshold}°C\n\n☀️ Mantenha-se hidratado!\n\n_SMI-PE - Sistema Meteorológico Inteligente_`
    }

    return alertMessages[alertType as keyof typeof alertMessages] || 'Alerta meteorológico'
  }

  formatDailyPromoMessage(userName: string, cityName: string, forecast: string): string {
    return `🌤️ *Bom dia, ${userName}!* 🌤️\n\nPrevisão para hoje em ${cityName}:\n${forecast}\n\n🎯 *Oferta Especial do Dia!*\nAproveite nossos produtos com desconto especial!\n👉 https://exemplo.com/ofertas\n\n_Para parar de receber essas mensagens, responda: SAIR_\n\n_SMI-PE - Sistema Meteorológico Inteligente_`
  }
}

export const whatsappService = new WhatsAppService()
