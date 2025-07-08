// app/api/weather/forecast/route.ts
import { NextResponse } from 'next/server';
import { getForecastWithFallback } from '@/lib/weather/forecast';

export async function GET() {
  try {
    const forecast = await getForecastWithFallback();
    return NextResponse.json(forecast);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao obter previsão do tempo. Todas as fontes falharam.' },
      { status: 500 }
    );
  }
}
