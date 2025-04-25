import { NextResponse } from 'next/server';
import axios from 'axios';

const webhookUrl = 'https://n8n.targetweb.tech/webhook/f3cdcfd1-71d8-46fb-b6cd-c855cdd8e1db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await axios.post(webhookUrl, body, {
      timeout: 180000, // 3 minutos
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Retorna os dados do webhook
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Erro no proxy:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: error.response?.status || 500 }
    );
  }
}
