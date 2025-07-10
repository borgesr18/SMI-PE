// sendMessage.ts
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);

export async function sendTestMessage() {
  try {
    const message = await client.messages.create({
      from: 'whatsapp:+15558131756', // Número provisionado no Twilio
      to: 'whatsapp:+5581988812842', // Coloque um número verificado, tipo +55DDDNÚMERO
      body: '🌤️ Alerta SMI-PE: A previsão para hoje em Caruaru é de névoa com temperatura de 19°C.',
    });

    console.log('Mensagem enviada:', message.sid);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
}
