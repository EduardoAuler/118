// Teste detalhado da integração PagBank
require('dotenv').config();

const PAGBANK_TOKEN = (process.env.PAGBANK_TOKEN || "").trim();

async function testToken() {
  console.log('🔍 Teste detalhado de integração PagBank\n');
  console.log('📋 Informações do token:');
  console.log('   Primeiros 30 chars:', PAGBANK_TOKEN.substring(0, 30));
  console.log('   Últimos 30 chars:', PAGBANK_TOKEN.substring(PAGBANK_TOKEN.length - 30));
  console.log('   Tamanho total:', PAGBANK_TOKEN.length, 'caracteres');
  console.log('   Contém espaços?', PAGBANK_TOKEN.includes(' ') ? 'SIM ❌' : 'NÃO ✅');
  console.log('   Contém quebras de linha?', PAGBANK_TOKEN.includes('\n') ? 'SIM ❌' : 'NÃO ✅');
  console.log('');

  // Testar endpoint mais simples primeiro (se existir)
  const endpoints = [
    { url: 'https://api.pagseguro.com/checkouts', method: 'POST', name: 'Criar Checkout (Produção)' },
    { url: 'https://sandbox.api.pagseguro.com/checkouts', method: 'POST', name: 'Criar Checkout (Sandbox)' },
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🧪 Testando: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}`);
    
    const testData = {
      reference_id: "test-" + Date.now(),
      customer: {
        name: "Teste",
        email: "teste@teste.com",
        tax_id: "12345678909"
      },
      items: [{
        reference_id: "item-1",
        name: "Teste",
        quantity: 1,
        unit_amount: 100
      }]
    };

    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${PAGBANK_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const data = await response.json();
      
      console.log(`   Status HTTP: ${response.status}`);
      
      if (response.ok) {
        console.log('   ✅ SUCESSO! Token válido!');
        console.log('   Checkout ID:', data.id);
        return true;
      } else {
        console.log('   ❌ Erro:', response.status);
        if (data.error_messages) {
          data.error_messages.forEach(err => {
            console.log(`      - ${err.error}: ${err.description}`);
          });
        } else {
          console.log('   Resposta:', JSON.stringify(data, null, 2));
        }
      }
    } catch (error) {
      console.log(`   ❌ Erro de conexão: ${error.message}`);
    }
  }

  console.log('\n💡 Possíveis problemas:');
  console.log('   1. Token pode estar expirado - gere um novo no painel do PagBank');
  console.log('   2. Token de sandbox sendo usado em produção (ou vice-versa)');
  console.log('   3. Conta não é do tipo "Vendedor"');
  console.log('   4. Permissões da API não habilitadas no painel');
  console.log('   5. Token foi copiado incorretamente (incompleto ou com caracteres extras)');
  
  return false;
}

testToken();
