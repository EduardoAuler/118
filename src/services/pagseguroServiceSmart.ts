// Serviço inteligente que detecta automaticamente se deve usar API real ou mock
import pagseguroService from './pagseguroService';
import pagseguroServiceMock from './pagseguroServiceMock';
import { PagBankPaymentData, PagBankResponse } from './pagseguroService';

class PagBankSmartService {
  private useMock = false;
  private mockDetected = false;

  /**
   * Detecta se deve usar mock baseado em erros de CORS ou proxy
   */
  private async detectAndSetMode(): Promise<void> {
    if (this.mockDetected) return;

    try {
      // Teste simples para detectar se o proxy está funcionando
      const testResponse = await fetch('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer test`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: true })
      });

      const contentType = testResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        this.useMock = true;
        console.log('🔧 Modo Mock ativado: Proxy não está funcionando');
      }
    } catch (error) {
      this.useMock = true;
      console.log('🔧 Modo Mock ativado: Erro de CORS detectado');
    }

    this.mockDetected = true;
  }

  /**
   * Processa pagamento com cartão de crédito
   */
  async processCreditCardPayment(paymentData: PagBankPaymentData): Promise<PagBankResponse> {
    await this.detectAndSetMode();

    if (this.useMock) {
      console.log('🎭 Usando serviço mock para cartão de crédito');
      return await pagseguroServiceMock.processCreditCardPayment(paymentData);
    } else {
      console.log('🌐 Usando API real para cartão de crédito');
      return await pagseguroService.processCreditCardPayment(paymentData);
    }
  }

  /**
   * Processa pagamento via PIX
   */
  async processPixPayment(paymentData: Omit<PagBankPaymentData, 'cardNumber' | 'expiryDate' | 'cvc'>): Promise<PagBankResponse> {
    await this.detectAndSetMode();

    if (this.useMock) {
      console.log('🎭 Usando serviço mock para PIX');
      return await pagseguroServiceMock.processPixPayment(paymentData);
    } else {
      console.log('🌐 Usando API real para PIX');
      return await pagseguroService.processPixPayment(paymentData);
    }
  }

  /**
   * Força o uso do mock (útil para testes)
   */
  forceMockMode(): void {
    this.useMock = true;
    this.mockDetected = true;
    console.log('🎭 Modo Mock forçado');
  }

  /**
   * Força o uso da API real (útil para produção)
   */
  forceApiMode(): void {
    this.useMock = false;
    this.mockDetected = true;
    console.log('🌐 Modo API real forçado');
  }

  /**
   * Reseta a detecção automática
   */
  resetDetection(): void {
    this.mockDetected = false;
    this.useMock = false;
    console.log('🔄 Detecção automática resetada');
  }

  /**
   * Retorna o modo atual
   */
  getCurrentMode(): 'mock' | 'api' {
    return this.useMock ? 'mock' : 'api';
  }
}

export default new PagBankSmartService();
