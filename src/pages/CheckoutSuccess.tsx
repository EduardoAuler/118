import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import logo from "../assets/Podostore/Logo/Branco/Assinatura Visual_Tudo Sobre Palmilhas (branco).png";
import paymentStatusService, { PaymentStatusData, PaymentStatus } from '../services/paymentStatusService';
import './Checkout.css';

const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('checking');
  const [paymentData, setPaymentData] = useState<PaymentStatusData | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Obter checkoutId da URL ou localStorage
  useEffect(() => {
    const id = searchParams.get('checkoutId') || 
               searchParams.get('id') || 
               sessionStorage.getItem('currentCheckoutId') ||
               paymentStatusService.getLastCheckoutId();
    
    if (id) {
      setCheckoutId(id);
    } else {
      setPaymentStatus('error');
      setErrorMessage('ID do checkout não encontrado. Verifique se você completou o processo de checkout.');
    }
  }, [searchParams]);

  // Verificar status do pagamento com polling
  useEffect(() => {
    if (!checkoutId) return;

    // Iniciar polling de status
    const stopPolling = paymentStatusService.startPolling(
      checkoutId,
      (statusData) => {
        setPaymentData(statusData);
        setPaymentStatus(statusData.status);
        
        if (statusData.error) {
          setErrorMessage(statusData.error);
        }

        // Se pagamento aprovado, iniciar countdown
        if (statusData.status === 'paid') {
          setCountdown(5);
        }
      },
      () => {
        console.log('Polling concluído para checkout:', checkoutId);
      }
    );

    // Limpar polling ao desmontar componente
    return () => {
      stopPolling();
    };
  }, [checkoutId]);

  // Countdown apenas se pagamento aprovado
  useEffect(() => {
    if (paymentStatus !== 'paid') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, paymentStatus]);

  return (
    <div className="checkout-page">
      <div className="background-overlay" />
      
      <header className="checkout-header">
        <div className="logo-container">
          <div className="logo-icon">
            <img
              src={logo}
              alt="Logo Tudo Sobre Palmilhas"
              style={{
                filter: 'brightness(0) saturate(100%)',
                width: '40px',
                height: '40px',
                objectFit: 'contain'
              }}
            />
          </div>
          <span className="logo-text">Podostore</span>
        </div>
      </header>

      <div className="checkout-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        {paymentStatus === 'checking' && (
          <div className="status-message checking">
            <div className="status-icon">
              <div className="spinner"></div>
            </div>
            <h1>Verificando Pagamento...</h1>
            <p>Aguarde enquanto verificamos o status do seu pagamento.</p>
            {checkoutId && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem' }}>
                ID: <code>{checkoutId.substring(0, 20)}...</code>
              </p>
            )}
          </div>
        )}

        {paymentStatus === 'paid' && (
          <div className="success-message">
            <div className="success-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 12l2 2 4-4"/>
              </svg>
            </div>
            
            <h1>Pagamento Aprovado!</h1>
            
            <p>Obrigado por escolher o Podostore!</p>
            
            <div className="info-message success">
              <p>✅ Seu pagamento foi confirmado com sucesso.</p>
              {paymentData?.amount && (
                <p>💰 Valor pago: <strong>R$ {paymentData.amount.toFixed(2)}</strong></p>
              )}
              {paymentData?.paymentMethod && (
                <p>💳 Método: <strong>{paymentData.paymentMethod}</strong></p>
              )}
              <p>🎉 Sua assinatura está ativa e você já pode usar todos os recursos!</p>
              <p>Você será redirecionado para a página inicial em <strong>{countdown} segundos</strong>.</p>
            </div>

            <button 
              className="pay-button" 
              onClick={() => {
                paymentStatusService.clearLastCheckoutId();
                navigate('/home');
              }}
              style={{ marginTop: '2rem' }}
            >
              Ir para Página Inicial
            </button>
          </div>
        )}

        {paymentStatus === 'pending' && (
          <div className="status-message pending">
            <div className="status-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            
            <h1>Pagamento Pendente</h1>
            
            <p>Estamos aguardando a confirmação do seu pagamento.</p>
            
            <div className="info-message pending">
              <p>⏳ Seu pagamento está sendo processado.</p>
              <p>Esta página será atualizada automaticamente quando o pagamento for confirmado.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
                Verificando novamente em alguns segundos...
              </p>
            </div>

            <button 
              className="pay-button" 
              onClick={() => window.location.reload()}
              style={{ marginTop: '2rem', backgroundColor: '#f59e0b' }}
            >
              Atualizar Status
            </button>
          </div>
        )}

        {(paymentStatus === 'cancelled' || paymentStatus === 'failed') && (
          <div className="status-message error">
            <div className="status-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            
            <h1>
              {paymentStatus === 'cancelled' ? 'Pagamento Cancelado' : 'Pagamento Falhou'}
            </h1>
            
            <p>
              {paymentStatus === 'cancelled' 
                ? 'O pagamento foi cancelado. Você pode tentar novamente quando quiser.'
                : 'Não foi possível processar o pagamento. Verifique seus dados e tente novamente.'}
            </p>
            
            <div className="info-message error">
              <p>❌ {paymentStatus === 'cancelled' ? 'Pagamento cancelado pelo usuário ou sistema.' : 'Falha no processamento do pagamento.'}</p>
              <p>Se você já realizou o pagamento, entre em contato com o suporte.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                className="pay-button" 
                onClick={() => navigate('/checkout')}
                style={{ backgroundColor: '#ef4444' }}
              >
                Tentar Novamente
              </button>
              <button 
                className="pay-button" 
                onClick={() => navigate('/home')}
                style={{ backgroundColor: '#6b7280' }}
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="status-message error">
            <div className="status-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            
            <h1>Erro ao Verificar Pagamento</h1>
            
            <p>{errorMessage || 'Ocorreu um erro ao verificar o status do pagamento.'}</p>
            
            <div className="info-message error">
              <p>⚠️ Não foi possível verificar o status do seu pagamento automaticamente.</p>
              <p>Verifique sua conexão ou tente novamente mais tarde.</p>
              {checkoutId && (
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  ID do Checkout: <code>{checkoutId}</code>
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                className="pay-button" 
                onClick={() => window.location.reload()}
                style={{ backgroundColor: '#3b82f6' }}
              >
                Tentar Novamente
              </button>
              <button 
                className="pay-button" 
                onClick={() => navigate('/home')}
                style={{ backgroundColor: '#6b7280' }}
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .success-message,
        .status-message {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 1rem;
          padding: 3rem 2rem;
          text-align: center;
          max-width: 500px;
          width: 100%;
          box-shadow: 
            0 8px 32px rgba(21, 66, 119, 0.15),
            0 4px 16px rgba(21, 66, 119, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .status-icon,
        .success-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(59, 130, 246, 0.1);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .success-message h1,
        .status-message h1 {
          color: #173f5f;
          font-size: 1.75rem;
          margin-bottom: 1rem;
        }

        .success-message p,
        .status-message p {
          color: #6b7280;
          font-size: 1rem;
          margin: 0.5rem 0;
        }

        .info-message {
          margin: 2rem 0;
          padding: 1.25rem;
          border-radius: 0.75rem;
        }

        .info-message.success {
          background: linear-gradient(120deg, rgba(16, 185, 129, 0.1), rgba(124, 195, 90, 0.1));
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .info-message.pending {
          background: linear-gradient(120deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.1));
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .info-message.error {
          background: linear-gradient(120deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.1));
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .info-message p {
          margin: 0.5rem 0;
        }

        .info-message code {
          background: rgba(0, 0, 0, 0.05);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default CheckoutSuccess;
