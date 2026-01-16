// Dados de teste para PagBank (ambiente sandbox)
// Use estes dados para testar a integração sem usar cartões reais

export const TEST_CREDIT_CARDS = {
  // Cartão de teste aprovado
  APPROVED: {
    number: '4111111111111111',
    expiryDate: '12 / 30',
    cvc: '123',
    holder: 'MARIA S S'
  },
  // Cartão de teste recusado
  DECLINED: {
    number: '4000000000000002',
    expiryDate: '12 / 30',
    cvc: '123',
    holder: 'MARIA S S'
  },
  // Cartão de teste com erro
  ERROR: {
    number: '4000000000000069',
    expiryDate: '12 / 30',
    cvc: '123',
    holder: 'MARIA S S'
  }
};

export const TEST_CUSTOMER_DATA = {
  name: 'Maria Silva Santos',
  email: 'maria.silva@example.com',
  taxId: '11122233344', // CPF de teste
  phone: '(11) 99999-9999',
  address: 'Rua das Flores, 123, Centro, São Paulo - SP'
};

export const TEST_PRODUCT = {
  name: 'Plano Profissional - Acesso Vitalício',
  amount: 99.99,
  description: 'Plano Profissional - Acesso Vitalício'
};

// Instruções para teste:
// 1. Use os dados de TEST_CUSTOMER_DATA para preencher o formulário
// 2. Para cartão de crédito, use TEST_CREDIT_CARDS.APPROVED
// 3. Para PIX, apenas preencha os dados do cliente
// 4. Todos os pagamentos são processados no ambiente sandbox do PagBank
