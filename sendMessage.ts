// sendMessage.ts
import 'dotenv/config';
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const from = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
const to = 'whatsapp:+5581988812842'; // Troque por seu número verificado

async function main() {
  try {
    const result = await client.messages.create({
      body: 'Mensagem de teste enviada com sucesso!',
      from,
      to,
    });

    console.log('Mensagem enviada com SID:', result.sid);
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
  }
}

main();
