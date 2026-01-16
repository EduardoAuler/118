import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

// TS no ambiente de functions pode não ter os tipos de fetch disponíveis
declare const fetch: any;

// Preferencial: PAGBANK_TOKEN (server-only). Fallback: REACT_APP_PAGBANK_TOKEN (não recomendado expor em client)
const RAW_TOKEN = (process.env.PAGBANK_TOKEN || process.env.REACT_APP_PAGBANK_TOKEN || '').trim();
const PAGBANK_API = 'https://api.pagseguro.com';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Permitir CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    if (!RAW_TOKEN) {
      console.error('❌ Token PagBank não configurado: defina PAGBANK_TOKEN nas variáveis de ambiente');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Configuração ausente: PAGBANK_TOKEN' }),
      };
    }
    const checkoutData = JSON.parse(event.body || '{}');

    // O formato do telefone já está correto no checkoutData enviado
    console.log('🚀 Criando checkout no PagBank:', checkoutData);

    const response = await fetch(`${PAGBANK_API}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RAW_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erro PagBank:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify(data),
      };
    }

    console.log('✅ Checkout criado:', data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('❌ Erro na function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro interno',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
