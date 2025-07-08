// pages/api/send-weather.ts
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);

export async function GET(req: NextRequest) {
  const to = 'whatsapp:+558173184716'; // Seu número no sandbox
  const from = 'whatsapp:+14155238886'; // Número da Twilio

  try {
    const message = await client.messages.create({
      from,
      to,
      contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e', // Template aprovado
      contentVariables: JSON.stringify({
        '1': '09/07', // Data
        '2': '18h00', // Horário
      }),
    });

    return NextResponse.json({ status: 'success', sid: message.sid });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: (error as any).message });
  }
}
