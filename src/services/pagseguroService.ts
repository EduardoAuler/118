// Serviço para integração com PagBank (antigo PagSeguro)
// Implementação completa com credenciais reais para ambiente de sandbox

export interface PagBankPaymentData {
  email: string;
  name: string;
  address: string;
  country: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  amount: number;
  description: string;
  taxId?: string;
  phone?: string;
}

export interface PagBankResponse {
  success: boolean;
  orderId?: string;
  chargeId?: string;
  paymentUrl?: string;
  qrCode?: string;
  error?: string;
  errors?: Array<{
    code: string;
    message: string;
    parameter_name?: string;
  }>;
}

export interface PagBankOrder {
  id: string;
  reference_id: string;
  status: 'PAID' | 'PENDING' | 'CANCELLED' | 'FAILED';
  created_at: string;
  amount: {
    value: number;
    currency: string;
  };
  charges: Array<{
    id: string;
    status: string;
    amount: {
      value: number;
      currency: string;
    };
    payment_method: {
      type: string;
      installments?: number;
      capture?: boolean;
    };
    paid_at?: string;
  }>;
  qr_codes?: Array<{
    id: string;
    amount: {
      value: number;
      currency: string;
    };
    expiration_date: string;
    emv: string;
  }>;
  links: Array<{
    rel: string;
    href: string;
  }>;
}

export interface CheckoutData {
  email: string;
  name: string;
  taxId: string;
  phone: string;
  amount: number;
  description: string;
}

export interface CheckoutResponse {
  success: boolean;
  error?: string;
  errors?: Array<{ message: string }>;
  checkoutId?: string;
  checkoutUrl?: string;
}

class PagBankService {
  private readonly baseUrl = 'https://api.pagseguro.com';
  private readonly token = 'bc47a893-fec0-4448-9c92-7889e5ade8bd410fca8f4b5c8ce3a81902169e710781f23e-f379-4577-b1cf-c13e73ef2195';
  private readonly email = 'cursos@posturologiaintegrada.com';

  /**
   * Gera um ID único para referência do pedido
   */
  private generateReferenceId(): string {
    return `PED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gera um ID único para idempotência
   */
  private generateIdempotencyKey(): string {
    return `idemp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Valida e formata CPF/CNPJ
   */
  private formatTaxId(taxId: string): string {
    if (!taxId) return '';
    return taxId.replace(/\D/g, '');
  }

  /**
   * Valida se o CPF/CNPJ tem o tamanho correto
   */
  private validateTaxId(taxId: string): boolean {
    const cleanTaxId = this.formatTaxId(taxId);
    return cleanTaxId.length === 11 || cleanTaxId.length === 14;
  }

  /**
   * Processa o pagamento com cartão de crédito
   */
  async processCreditCardPayment(paymentData: PagBankPaymentData): Promise<PagBankResponse> {
    try {
      // Validação básica dos dados
      if (!this.validatePaymentData(paymentData)) {
        return {
          success: false,
          error: 'Dados de pagamento inválidos'
        };
      }

      const referenceId = this.generateReferenceId();
      const idempotencyKey = this.generateIdempotencyKey();
      
      // Formatar dados do cartão
      const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
      const [expMonth, expYear] = paymentData.expiryDate.split(' / ');
      const fullExpYear = `20${expYear}`;

      // Dados do pedido para PagBank
      const orderData = {
        reference_id: referenceId,
        customer: {
          name: paymentData.name.toUpperCase(),
          email: paymentData.email,
          tax_id: paymentData.taxId || '11122233344', // CPF padrão para teste
          phones: paymentData.phone ? [
            {
              country: '55',
              area: '11',
              number: paymentData.phone.replace(/\D/g, ''),
              type: 'MOBILE'
            }
          ] : []
        },
        items: [
          {
            name: paymentData.description,
            quantity: 1,
            unit_amount: Math.round(paymentData.amount * 100) // Valor em centavos
          }
        ],
        charges: [
          {
            reference_id: `CHG-${referenceId}`,
            description: paymentData.description,
            amount: {
              value: Math.round(paymentData.amount * 100),
              currency: 'BRL'
            },
            payment_method: {
              type: 'CREDIT_CARD',
              installments: 1,
              capture: true,
              card: {
                number: cardNumber,
                exp_month: expMonth,
                exp_year: fullExpYear,
                security_code: paymentData.cvc,
                holder: {
                  name: paymentData.name.toUpperCase()
                }
              }
            }
          }
        ]
      };

      console.log('Enviando pedido para PagBank:', orderData);

      const response = await fetch(`/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'x-idempotency-key': idempotencyKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      // Verificar se a resposta é HTML (erro 404 do proxy)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('CORS_PROXY_ERROR');
      }

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Erro na API PagBank:', responseData);
        return {
          success: false,
          error: responseData.errors?.[0]?.message || `Erro ${response.status}: ${response.statusText}`,
          errors: responseData.errors
        };
      }

      console.log('Resposta PagBank:', responseData);

      // Verificar se o pagamento foi aprovado
      const charge = responseData.charges?.[0];
      if (charge && charge.status === 'PAID') {
        return {
          success: true,
          orderId: responseData.id,
          chargeId: charge.id,
          paymentUrl: undefined
        };
      } else {
        return {
          success: false,
          error: `Pagamento não aprovado. Status: ${charge?.status || 'Desconhecido'}`
        };
      }

    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Processa pagamento via PIX
   */
  async processPixPayment(paymentData: Omit<PagBankPaymentData, 'cardNumber' | 'expiryDate' | 'cvc'>): Promise<PagBankResponse> {
    try {
      // Validação básica dos dados
      if (!paymentData.email || !paymentData.name || !paymentData.amount) {
        return {
          success: false,
          error: 'Dados de pagamento inválidos'
        };
      }

      const referenceId = this.generateReferenceId();
      const idempotencyKey = this.generateIdempotencyKey();
      
      // Dados do pedido para PagBank com PIX
      const orderData = {
        reference_id: referenceId,
        customer: {
          name: paymentData.name.toUpperCase(),
          email: paymentData.email,
          tax_id: paymentData.taxId || '11122233344', // CPF padrão para teste
          phones: paymentData.phone ? [
            {
              country: '55',
              area: '11',
              number: paymentData.phone.replace(/\D/g, ''),
              type: 'MOBILE'
            }
          ] : []
        },
        items: [
          {
            name: paymentData.description,
            quantity: 1,
            unit_amount: Math.round(paymentData.amount * 100) // Valor em centavos
          }
        ],
        qr_codes: [
          {
            amount: {
              value: Math.round(paymentData.amount * 100),
              currency: 'BRL'
            },
            expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
          }
        ]
      };

      console.log('Enviando pedido PIX para PagBank:', orderData);

      const response = await fetch(`/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'x-idempotency-key': idempotencyKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      // Verificar se a resposta é HTML (erro 404 do proxy)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('CORS_PROXY_ERROR');
      }

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Erro na API PagBank PIX:', responseData);
        return {
          success: false,
          error: responseData.errors?.[0]?.message || `Erro ${response.status}: ${response.statusText}`,
          errors: responseData.errors
        };
      }

      console.log('Resposta PagBank PIX:', responseData);

      // Verificar se o QR Code foi gerado
      const qrCode = responseData.qr_codes?.[0];
      if (qrCode && qrCode.emv) {
        return {
          success: true,
          orderId: responseData.id,
          qrCode: qrCode.emv,
          paymentUrl: `https://pix.pagseguro.com.br/qr-code/${qrCode.id}`
        };
      } else {
        return {
          success: false,
          error: 'Falha ao gerar QR Code PIX'
        };
      }

    } catch (error) {
      console.error('Erro ao processar pagamento PIX:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Valida os dados de pagamento
   */
  private validatePaymentData(data: PagBankPaymentData): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cardNumberRegex = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
    const expiryDateRegex = /^\d{2}\s\/\s\d{2}$/;
    const cvcRegex = /^\d{3,4}$/;

    return (
      emailRegex.test(data.email) &&
      data.name.trim().length > 0 &&
      data.address.trim().length > 0 &&
      cardNumberRegex.test(data.cardNumber) &&
      expiryDateRegex.test(data.expiryDate) &&
      cvcRegex.test(data.cvc) &&
      data.amount > 0
    );
  }

  /**
   * Consulta status de um pedido
   */
  async getOrderStatus(orderId: string): Promise<PagBankOrder | null> {
    try {
      const response = await fetch(`/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        console.error('Erro ao consultar pedido:', response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao consultar status do pedido:', error);
      return null;
    }
  }

  /**
   * Consulta pedido por charge ID
   */
  async getOrderByChargeId(chargeId: string): Promise<PagBankOrder | null> {
    try {
      const response = await fetch(`/orders?charge_id=${chargeId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        console.error('Erro ao consultar pedido por charge:', response.status);
        return null;
      }

      const data = await response.json();
      return data.data?.[0] || null;
    } catch (error) {
      console.error('Erro ao consultar pedido por charge:', error);
      return null;
    }
  }

  /**
   * Cria um checkout e retorna a URL de pagamento
   */
  async createCheckout(data: CheckoutData): Promise<CheckoutResponse> {
    try {
      const referenceId = this.generateReferenceId();

      // Dados do checkout
      // Processamento e validação de telefone (DDD + número BR)
      const cleanPhone = (data.phone || '').replace(/\D/g, '');
      let phoneArea = '';
      let rawNumber = '';
      if (cleanPhone.length >= 10) {
        phoneArea = cleanPhone.substring(0, 2);
        rawNumber = cleanPhone.substring(2);
      } else if (cleanPhone.length >= 8) {
        // Sem DDD aparente: assume '11' e usa o restante como número
        phoneArea = '11';
        rawNumber = cleanPhone;
      }
      // Normaliza para 9 dígitos (celular) conforme exigido em muitos contextos do PagBank
      // - Se vier com 8 dígitos, prefixa '9'
      // - Se vier com >9, considera os últimos 9 dígitos
      // - Se vier com <8, usa fallback padrão
      let phoneNumber = rawNumber;
      if (rawNumber.length === 8) {
        phoneNumber = `9${rawNumber}`;
      } else if (rawNumber.length > 9) {
        phoneNumber = rawNumber.slice(-9);
      }
      if (phoneArea.length !== 2 || phoneNumber.length < 8) {
        phoneArea = '11';
        phoneNumber = '999999999';
      }

      const hasHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

      const checkoutData: any = {
        reference_id: referenceId,
        customer_modifiable: false,
        customer: {
          name: data.name.toUpperCase(),
          email: data.email,
          tax_id: data.taxId.replace(/\D/g, ''),
          phone: {
            country: '55',
            area: phoneArea || '11',
            number: phoneNumber || '999999999'
          }
        },
        items: [
          {
            name: data.description,
            quantity: 1,
            unit_amount: Math.round(data.amount * 100) // Centavos
          }
        ],
        payment_methods: [
          { type: 'CREDIT_CARD' },
          { type: 'DEBIT_CARD' },
          { type: 'PIX' },
          { type: 'BOLETO' }
        ],
        payment_methods_configs: [
          {
            type: 'CREDIT_CARD',
            max_installments: 12,
            max_installments_no_interest: 1
          }
        ],
        soft_descriptor: 'PODOSTORE'
      };

      // Só enviar URLs de redirecionamento se forem HTTPS válidas
      if (hasHttps) {
        checkoutData.redirect_url = `${window.location.origin}/checkout-success`;
        checkoutData.return_url = `${window.location.origin}/checkout-success`;
      }

      console.log('🚀 Criando checkout no PagBank:', checkoutData);

      // Sempre usar Netlify Function para evitar CORS
      // A function funciona tanto em dev quanto em produção
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutData)
      });

      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Resposta não é JSON:', text);
        return {
          success: false,
          error: `Erro ${response.status}: Resposta inválida do servidor`
        };
      }

      const responseData = await response.json();

      if (!response.ok) {
        console.error('❌ Erro na API PagBank:', responseData);
        return {
          success: false,
          error: responseData.errors?.[0]?.message || `Erro ${response.status}`,
          errors: responseData.errors
        };
      }

      console.log('✅ Checkout criado:', responseData);

      // Extrair URL de pagamento (rel 'PAY' na API de Checkout PagBank)
      const payLink = responseData.links?.find((link: any) => (link.rel || '').toUpperCase() === 'PAY');
      const checkoutUrl = payLink?.href || responseData.links?.[0]?.href || '';

      return {
        success: true,
        checkoutId: responseData.id,
        checkoutUrl: checkoutUrl
      };

    } catch (error) {
      console.error('❌ Erro ao criar checkout:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

}
const pagBankServiceInstance = new PagBankService();
export default pagBankServiceInstance;
