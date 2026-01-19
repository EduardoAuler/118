import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

// TS no ambiente de functions pode não ter os tipos de fetch disponíveis
declare const fetch: any;

// Preferencial: PAGBANK_TOKEN (server-only). Fallback: REACT_APP_PAGBANK_TOKEN (não recomendado expor em client)
const RAW_TOKEN = (process.env.PAGBANK_TOKEN || process.env.REACT_APP_PAGBANK_TOKEN || '').trim();
// Suporta sandbox via variável de ambiente (PAGBANK_SANDBOX=true usa sandbox)
const USE_SANDBOX = process.env.PAGBANK_SANDBOX === 'true';
const PAGBANK_API = USE_SANDBOX 
  ? 'https://sandbox.api.pagseguro.com' 
  : 'https://api.pagseguro.com';

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

    let data: any;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { error: 'Resposta inválida do PagBank', status: response.status };
    }

    if (!response.ok) {
      console.error('❌ Erro PagBank:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      // Mensagens mais claras para erros comuns
      let errorMessage = data.errors?.[0]?.message || data.error || `Erro ${response.status}`;
      
      if (response.status === 403) {
        errorMessage = 'Token do PagBank inválido ou sem permissão. Verifique PAGBANK_TOKEN nas variáveis de ambiente.';
      } else if (response.status === 401) {
        errorMessage = 'Token do PagBank não autorizado. Verifique se o token está correto.';
      } else if (response.status === 400) {
        errorMessage = data.errors?.[0]?.message || 'Dados do checkout inválidos. Verifique os campos enviados.';
      }
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: errorMessage,
          errors: data.errors || [],
          details: data
        }),
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
