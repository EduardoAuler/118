// Script de teste para verificar integração com PagBank (testando sandbox e produção)
require('dotenv').config();

const PAGBANK_TOKEN = (process.env.PAGBANK_TOKEN || "").trim();

// URLs possíveis
const APIS = {
  sandbox: "https://sandbox.api.pagseguro.com",
  producao: "https://api.pagseguro.com"
};

async function testPagBankIntegration(apiUrl, ambiente) {
  console.log(`\n🔍 Testando ${ambiente} (${apiUrl})...`);
  
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
        unit_amount: 100
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
    const response = await fetch(`${apiUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAGBANK_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCheckout)
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ SUCESSO em ${ambiente}!`);
      console.log('   ID:', data.id);
      console.log('   Status:', data.status);
      return true;
    } else {
      console.log(`❌ Erro em ${ambiente}:`);
      console.log('   Status:', response.status);
      if (data.error_messages && data.error_messages.length > 0) {
        console.log('   Erro:', data.error_messages[0].error);
        console.log('   Descrição:', data.error_messages[0].description);
      }
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro de conexão em ${ambiente}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Testando integração com PagBank...\n');
  console.log('Token (primeiros 20 chars):', PAGBANK_TOKEN.substring(0, 20) + '...');
  console.log('Tamanho do token:', PAGBANK_TOKEN.length, 'caracteres\n');

  // Testar sandbox primeiro
  const sandboxOk = await testPagBankIntegration(APIS.sandbox, 'SANDBOX');
  
  // Se sandbox não funcionar, testar produção
  if (!sandboxOk) {
    await testPagBankIntegration(APIS.producao, 'PRODUÇÃO');
  }

  console.log('\n💡 Dica: Se ambos falharem, verifique:');
  console.log('   - Se o token está completo e correto');
  console.log('   - Se o token não expirou');
  console.log('   - Se você está usando o token do ambiente correto (sandbox ou produção)');
}

main();
