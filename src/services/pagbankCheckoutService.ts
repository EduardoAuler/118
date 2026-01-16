// Serviço REAL para API de Checkout do PagBank
// Esta é a forma recomendada pelo PagBank para processar pagamentos

export interface CheckoutData {
  email: string;
  name: string;
  taxId: string;
  phone?: string;
  amount: number;
  description: string;
}

export interface CheckoutResponse {
  success: boolean;
  checkoutUrl?: string;
  checkoutId?: string;
  error?: string;
  errors?: Array<{
    code: string;
    message: string;
  }>;
}

class PagBankCheckoutService {
  // URL base do backend
  // No Netlify: usa as Netlify Functions automaticamente (/api/*)
  // No Vercel ou outro: usa REACT_APP_BACKEND_URL
  // Em desenvolvimento local: http://localhost:4000/api
  private getBackendUrl(): string {
    // Se tiver REACT_APP_USE_NETLIFY_FUNCTIONS configurado, usa Netlify Functions
    if (process.env.REACT_APP_USE_NETLIFY_FUNCTIONS === 'true') {
      return '/api';
    }
    
    // Se estiver no Netlify (detecta pelo hostname)
    if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
      return '/api';
    }
    
    // Se tiver REACT_APP_BACKEND_URL configurado, usa ele
    if (process.env.REACT_APP_BACKEND_URL) {
      return `${process.env.REACT_APP_BACKEND_URL}/api`;
    }
    
    // Fallback para desenvolvimento local
    return 'http://localhost:4000/api';
  }

  private get backendUrl(): string {
    return this.getBackendUrl();
  }

  /**
   * Gera um ID único para referência
   */
  private generateReferenceId(): string {
    return `CHK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtém a URL de redirecionamento após pagamento
   */
  private getRedirectUrl(): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/checkout/success`;
  }

  /**
   * Obtém a URL de retorno após pagamento
   */
  private getReturnUrl(): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/checkout/success`;
  }

  /**
   * Cria um checkout e retorna a URL de pagamento
   * Esta é a forma REAL e RECOMENDADA pelo PagBank
   */
  async createCheckout(data: CheckoutData): Promise<CheckoutResponse> {
    try {
      const referenceId = this.generateReferenceId();

      // Preparar telefone - FIXO DEFINITIVO
      const cleanPhone = data.phone?.replace(/\D/g, '') || '';
      
      // Telefone brasileiro: (XX) XXXXX-XXXX = 11 dígitos OU (XX) XXXX-XXXX = 10 dígitos
      let phoneArea = '';
      let phoneNumber = '';
      
      if (cleanPhone.length === 11) {
        // Celular: (11) 99999-9999
        phoneArea = cleanPhone.substring(0, 2);
        phoneNumber = cleanPhone.substring(2);
      } else if (cleanPhone.length === 10) {
        // Fixo: (11) 9999-9999
        phoneArea = cleanPhone.substring(0, 2);
        phoneNumber = cleanPhone.substring(2);
      } else if (cleanPhone.length >= 8) {
        // Tenta extrair DDD dos primeiros 2 dígitos
        phoneArea = cleanPhone.substring(0, 2);
        phoneNumber = cleanPhone.substring(2);
      }

      // Validar se tem dados válidos
      const hasValidPhone = phoneArea.length === 2 && phoneNumber.length >= 8 && phoneNumber.length <= 9;

      console.log('📞 TELEFONE PROCESSADO:', {
        original: data.phone,
        cleanPhone,
        phoneArea,
        phoneNumber,
        hasValidPhone,
        willUse: hasValidPhone ? `${phoneArea} ${phoneNumber}` : '11 999999999 (default)'
      });

      // Dados do checkout conforme documentação oficial
      const checkoutData = {
        reference_id: referenceId,
        customer_modifiable: false,
        customer: {
          name: data.name.toUpperCase(),
          email: data.email,
          tax_id: data.taxId.replace(/\D/g, ''),
          phone: hasValidPhone ? {
            country: '55',
            area: phoneArea,
            number: phoneNumber
          } : {
            country: '55',
            area: '11',
            number: '999999999'
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
        soft_descriptor: 'PODOSTORE',
        // URLs de redirecionamento
        redirect_url: this.getRedirectUrl(),
        return_url: this.getReturnUrl()
      };

      console.log('🚀 Criando checkout real via backend Node:', checkoutData);

      // Chamar backend Node (Express) que fala com o PagBank
      const response = await fetch(`${this.backendUrl}/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('❌ Erro na API PagBank:', responseData);
        return {
          success: false,
          error: responseData.errors?.[0]?.message || `Erro ${response.status}`,
          errors: responseData.errors
        };
      }

      console.log('✅ Checkout criado com sucesso (backend Node):', responseData);

      // Extrair URL de pagamento (rel 'PAY') retornada pela API
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
        error: 'Erro ao criar checkout. Verifique sua conexão.'
      };
    }
  }

  /**
   * Consulta status de um checkout
   * Usa backend Node para evitar problemas de CORS
   */
  async getCheckoutStatus(checkoutId: string): Promise<any> {
    try {
      const functionResponse = await fetch(`${this.backendUrl}/payment-webhook?checkoutId=${checkoutId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (functionResponse.ok) {
        const data = await functionResponse.json();
        if (data.success) {
          return {
            id: data.checkoutId,
            status: data.status,
            charges: data.charges || []
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Erro ao consultar checkout:', error);
      return null;
    }
  }

  /**
   * Inativa um checkout
   * (atualmente não utilizado; mantido apenas por compatibilidade)
   */
  async inactivateCheckout(checkoutId: string): Promise<boolean> {
    try {
      console.warn('inactivateCheckout ainda não implementado no backend Node', { checkoutId });
      // Se no futuro você precisar realmente inativar um checkout,
      // crie a rota correspondente no backend e ajuste este método.
      return false;
    } catch (error) {
      console.error('Erro ao inativar checkout:', error);
      return false;
    }
  }

  /**
   * Ativa um checkout inativo
   * (atualmente não utilizado; mantido apenas por compatibilidade)
   */
  async activateCheckout(checkoutId: string): Promise<boolean> {
    try {
      console.warn('activateCheckout ainda não implementado no backend Node', { checkoutId });
      // Se no futuro você precisar realmente ativar um checkout,
      // crie a rota correspondente no backend e ajuste este método.
      return false;
    } catch (error) {
      console.error('Erro ao ativar checkout:', error);
      return false;
    }
  }
}

export default new PagBankCheckoutService();
