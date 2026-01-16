// Script de teste para verificar integração com PagBank
require('dotenv').config();

const PAGBANK_TOKEN = (process.env.PAGBANK_TOKEN || "").trim();
const PAGBANK_API = "https://api.pagseguro.com";

async function testPagBankIntegration() {
  console.log('🔍 Testando integração com PagBank...\n');
  
  if (!PAGBANK_TOKEN) {
    console.error('❌ PAGBANK_TOKEN não encontrado no .env');
    console.log('💡 Certifique-se de que o arquivo .env está na raiz do projeto com: PAGBANK_TOKEN=seu_token_aqui');
    process.exit(1);
  }

  console.log('✅ Token encontrado (primeiros 10 caracteres):', PAGBANK_TOKEN.substring(0, 10) + '...');
  console.log('📡 Testando conexão com API do PagBank...\n');

  // Teste 1: Verificar se o token é válido fazendo uma requisição simples
  // Vamos tentar criar um checkout de teste (sandbox)
  const testCheckout = {
    reference_id: "test-integration-" + Date.now(),
    customer: {
      name: "Teste Integração",
      email: "teste@exemplo.com",
      tax_id: "12345678909"
    },
    items: [
      {
        reference_id: "item-1",
        name: "Teste de Integração",
        quantity: 1,
        unit_amount: 100 // R$ 1,00 em centavos
      }
    ],
    shipping: {
      address: {
        street: "Rua Teste",
        number: "123",
        complement: "Apto 1",
        locality: "Centro",
        city: "São Paulo",
        region_code: "SP",
        country: "BRA",
        postal_code: "01310100"
      }
    }
  };

  try {
    const response = await fetch(`${PAGBANK_API}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAGBANK_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCheckout)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCESSO! Token do PagBank está funcionando!');
      console.log('📋 Detalhes do checkout criado:');
      console.log('   - ID:', data.id);
      console.log('   - Status:', data.status);
      console.log('   - Link de pagamento:', data.links?.find(l => l.rel === 'CHECKOUT')?.href || 'N/A');
      console.log('\n🎉 Integração configurada corretamente!');
    } else {
      console.error('❌ ERRO ao criar checkout:');
      console.error('   Status:', response.status);
      console.error('   Resposta:', JSON.stringify(data, null, 2));
      
      if (response.status === 401) {
        console.error('\n💡 O token pode estar inválido ou expirado. Verifique:');
        console.error('   - Se está usando o token correto (produção ou sandbox)');
        console.error('   - Se o token não expirou');
        console.error('   - Se copiou o token completo sem espaços');
      } else if (response.status === 403) {
        console.error('\n💡 O token pode não ter permissões suficientes.');
      }
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
    console.error('💡 Verifique sua conexão com a internet');
  }
}

testPagBankIntegration();
