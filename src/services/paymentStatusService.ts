/**
 * Serviço para gerenciar status de pagamentos
 * Centraliza a lógica de verificação e atualização de status
 */

import pagbankCheckoutService from './pagbankCheckoutService';

export type PaymentStatus = 'checking' | 'pending' | 'paid' | 'cancelled' | 'failed' | 'error';

export interface PaymentStatusData {
  status: PaymentStatus;
  checkoutId: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  paidAt?: string;
  error?: string;
}

class PaymentStatusService {
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private readonly POLLING_INTERVAL = 3000; // 3 segundos
  private readonly MAX_POLLING_ATTEMPTS = 20; // ~1 minuto

  /**
   * Verifica o status de um checkout
   */
  async checkStatus(checkoutId: string): Promise<PaymentStatusData> {
    try {
      const statusData = await pagbankCheckoutService.getCheckoutStatus(checkoutId);

      if (!statusData) {
        return {
          status: 'error',
          checkoutId,
          error: 'Não foi possível verificar o status do pagamento'
        };
      }

      const status = statusData.status || 'UNKNOWN';
      const charges = statusData.charges || [];
      
      // Determinar status final
      let finalStatus: PaymentStatus = 'pending';
      let paymentMethod = 'UNKNOWN';
      let paidAt: string | undefined;

      if (status === 'PAID' || charges.some((c: any) => c.status === 'PAID')) {
        finalStatus = 'paid';
        const paidCharge = charges.find((c: any) => c.status === 'PAID') || charges[0];
        paymentMethod = paidCharge.payment_method?.type || 'UNKNOWN';
        paidAt = paidCharge.paid_at || new Date().toISOString();
      } else if (status === 'CANCELLED' || charges.some((c: any) => c.status === 'CANCELLED')) {
        finalStatus = 'cancelled';
      } else if (status === 'FAILED' || charges.some((c: any) => c.status === 'FAILED')) {
        finalStatus = 'failed';
      } else if (status === 'PENDING' || charges.some((c: any) => c.status === 'PENDING')) {
        finalStatus = 'pending';
      }

      return {
        status: finalStatus,
        checkoutId,
        amount: statusData.amount?.value ? statusData.amount.value / 100 : undefined,
        currency: statusData.amount?.currency || 'BRL',
        paymentMethod,
        paidAt
      };

    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return {
        status: 'error',
        checkoutId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Inicia polling de status para um checkout
   */
  startPolling(
    checkoutId: string,
    onStatusUpdate: (status: PaymentStatusData) => void,
    onComplete?: () => void
  ): () => void {
    // Limpar polling anterior se existir
    this.stopPolling(checkoutId);

    let attempts = 0;

    const poll = async () => {
      attempts++;

      const statusData = await this.checkStatus(checkoutId);
      onStatusUpdate(statusData);

      // Parar polling se:
      // 1. Pagamento foi aprovado/cancelado/falhou
      // 2. Atingiu máximo de tentativas
      // 3. Erro permanente
      const shouldStop = 
        statusData.status === 'paid' ||
        statusData.status === 'cancelled' ||
        statusData.status === 'failed' ||
        attempts >= this.MAX_POLLING_ATTEMPTS ||
        (statusData.status === 'error' && attempts >= 5);

      if (shouldStop) {
        this.stopPolling(checkoutId);
        if (onComplete) {
          onComplete();
        }
        return;
      }

      // Continuar polling se ainda está pendente
      if (statusData.status === 'pending') {
        const interval = setTimeout(poll, this.POLLING_INTERVAL);
        this.pollingIntervals.set(checkoutId, interval);
      } else {
        this.stopPolling(checkoutId);
        if (onComplete) {
          onComplete();
        }
      }
    };

    // Iniciar primeira verificação imediatamente
    poll();

    // Retornar função para parar polling manualmente
    return () => this.stopPolling(checkoutId);
  }

  /**
   * Para o polling de um checkout
   */
  stopPolling(checkoutId: string): void {
    const interval = this.pollingIntervals.get(checkoutId);
    if (interval) {
      clearTimeout(interval);
      this.pollingIntervals.delete(checkoutId);
    }
  }

  /**
   * Para todos os pollings ativos
   */
  stopAllPolling(): void {
    this.pollingIntervals.forEach((interval) => {
      clearTimeout(interval);
    });
    this.pollingIntervals.clear();
  }

  /**
   * Obtém o último checkoutId do localStorage
   */
  getLastCheckoutId(): string | null {
    return localStorage.getItem('lastCheckoutId');
  }

  /**
   * Limpa o checkoutId salvo
   */
  clearLastCheckoutId(): void {
    localStorage.removeItem('lastCheckoutId');
    sessionStorage.removeItem('currentCheckoutId');
  }
}

export default new PaymentStatusService();
