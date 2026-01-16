// Serviço mock para desenvolvimento local (sem CORS)
// Simula as respostas da API PagBank para testes

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

class PagBankMockService {
  private readonly baseUrl = 'https://sandbox.api.pagseguro.com';
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
   * Processa o pagamento com cartão de crédito (MOCK)
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
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular dados que seriam enviados para PagBank
      const orderData = {
        reference_id: referenceId,
        customer: {
          name: paymentData.name.toUpperCase(),
          email: paymentData.email,
          tax_id: paymentData.taxId || '11122233344',
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
            unit_amount: Math.round(paymentData.amount * 100)
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
                number: paymentData.cardNumber.replace(/\s/g, ''),
                exp_month: paymentData.expiryDate.split(' / ')[0],
                exp_year: `20${paymentData.expiryDate.split(' / ')[1]}`,
                security_code: paymentData.cvc,
                holder: {
                  name: paymentData.name.toUpperCase()
                }
              }
            }
          }
        ]
      };

      console.log('🔧 MOCK: Dados que seriam enviados para PagBank:', orderData);

      // Simular diferentes cenários baseados no número do cartão
      const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
      let success = true;
      let errorMessage = '';

      if (cardNumber === '4000000000000002') {
        success = false;
        errorMessage = 'Cartão recusado pelo banco emissor';
      } else if (cardNumber === '4000000000000069') {
        success = false;
        errorMessage = 'Erro interno do processador';
      } else if (cardNumber === '4000000000000119') {
        success = false;
        errorMessage = 'Cartão expirado';
      } else if (!cardNumber.startsWith('4') && !cardNumber.startsWith('5')) {
        success = false;
        errorMessage = 'Número de cartão inválido';
      }

      if (!success) {
        return {
          success: false,
          error: errorMessage,
          errors: [
            {
              code: 'CARD_DECLINED',
              message: errorMessage
            }
          ]
        };
      }

      // Simular resposta de sucesso
      const mockResponse = {
        id: `ORDE_${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        reference_id: referenceId,
        status: 'PAID',
        created_at: new Date().toISOString(),
        amount: {
          value: Math.round(paymentData.amount * 100),
          currency: 'BRL'
        },
        charges: [
          {
            id: `CHAR_${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            reference_id: `CHG-${referenceId}`,
            status: 'PAID',
            amount: {
              value: Math.round(paymentData.amount * 100),
              currency: 'BRL'
            },
            payment_method: {
              type: 'CREDIT_CARD',
              installments: 1,
              capture: true
            },
            paid_at: new Date().toISOString()
          }
        ],
        links: [
          {
            rel: 'self',
            href: `https://sandbox.api.pagseguro.com/orders/ORDE_${Date.now()}`
          }
        ]
      };

      console.log('✅ MOCK: Resposta simulada do PagBank:', mockResponse);

      return {
        success: true,
        orderId: mockResponse.id,
        chargeId: mockResponse.charges[0].id,
        paymentUrl: undefined
      };

    } catch (error) {
      console.error('Erro no mock de pagamento:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Processa pagamento via PIX (MOCK)
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
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simular dados que seriam enviados para PagBank
      const orderData = {
        reference_id: referenceId,
        customer: {
          name: paymentData.name.toUpperCase(),
          email: paymentData.email,
          tax_id: paymentData.taxId || '11122233344',
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
            unit_amount: Math.round(paymentData.amount * 100)
          }
        ],
        qr_codes: [
          {
            amount: {
              value: Math.round(paymentData.amount * 100),
              currency: 'BRL'
            },
            expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString()
          }
        ]
      };

      console.log('🔧 MOCK PIX: Dados que seriam enviados para PagBank:', orderData);

      // Simular resposta de sucesso com QR Code
      const mockResponse = {
        id: `ORDE_${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        reference_id: referenceId,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        amount: {
          value: Math.round(paymentData.amount * 100),
          currency: 'BRL'
        },
        qr_codes: [
          {
            id: `QRC_${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            amount: {
              value: Math.round(paymentData.amount * 100),
              currency: 'BRL'
            },
            expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            emv: `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substr(2, 32)}520400005303986540599.995802BR5913PODOSTORE6009SAO PAULO62070503***6304${Math.random().toString(36).substr(2, 4)}`
          }
        ],
        links: [
          {
            rel: 'self',
            href: `https://sandbox.api.pagseguro.com/orders/ORDE_${Date.now()}`
          }
        ]
      };

      console.log('✅ MOCK PIX: Resposta simulada do PagBank:', mockResponse);

      return {
        success: true,
        orderId: mockResponse.id,
        qrCode: mockResponse.qr_codes[0].emv,
        paymentUrl: `https://pix.pagseguro.com.br/qr-code/${mockResponse.qr_codes[0].id}`
      };

    } catch (error) {
      console.error('Erro no mock de pagamento PIX:', error);
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
   * Consulta status de um pedido (MOCK)
   */
  async getOrderStatus(orderId: string): Promise<any> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: orderId,
        status: 'PAID',
        created_at: new Date().toISOString(),
        amount: { value: 9999, currency: 'BRL' }
      };
    } catch (error) {
      console.error('Erro ao consultar status do pedido:', error);
      return null;
    }
  }

  /**
   * Consulta pedido por charge ID (MOCK)
   */
  async getOrderByChargeId(chargeId: string): Promise<any> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: `ORDE_${Date.now()}`,
        status: 'PAID',
        created_at: new Date().toISOString(),
        amount: { value: 9999, currency: 'BRL' }
      };
    } catch (error) {
      console.error('Erro ao consultar pedido por charge:', error);
      return null;
    }
  }
}

export default new PagBankMockService();
