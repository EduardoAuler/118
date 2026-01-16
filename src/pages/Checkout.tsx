import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import pagseguroService from "../services/pagseguroService";
import { TEST_CUSTOMER_DATA } from "../examples/PagBankTestData";
import logo from "../assets/Podostore/Logo/Branco/Assinatura Visual_Tudo Sobre Palmilhas (branco).png";
import "./Checkout.css";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    country: "Brasil",
    address: "",
    taxId: "",
    phone: "",
    billingSameAsShipping: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const formatPhone = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 10) {
      return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateTaxId = (taxId: string): boolean => {
    const cleanTaxId = taxId.replace(/\D/g, '');
    return cleanTaxId.length === 11 || cleanTaxId.length === 14;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setCheckoutUrl(null);
    setError(null);

    try {
      // Validações
      if (!formData.email || !formData.name || !formData.taxId || !formData.phone) {
        setError('Por favor, preencha todos os campos obrigatórios');
        setIsLoading(false);
        return;
      }

      if (!validateEmail(formData.email)) {
        setError('Por favor, insira um email válido');
        setIsLoading(false);
        return;
      }

      if (!validateTaxId(formData.taxId)) {
        setError('CPF/CNPJ inválido. CPF deve ter 11 dígitos e CNPJ 14 dígitos');
        setIsLoading(false);
        return;
      }

      const checkoutData = {
        email: formData.email,
        name: formData.name,
        taxId: formData.taxId,
        phone: formData.phone,
        amount: 99.99,
        description: "Plano Profissional - Acesso Vitalício"
      };

      const response = await pagseguroService.createCheckout(checkoutData);

      if (response.success && response.checkoutUrl) {
        setCheckoutUrl(response.checkoutUrl);
        setError(null);
        
        // Salvar checkoutId no localStorage e sessionStorage para verificação posterior
        if (response.checkoutId) {
          localStorage.setItem('lastCheckoutId', response.checkoutId);
          sessionStorage.setItem('currentCheckoutId', response.checkoutId);
          
          // Adicionar checkoutId à URL de sucesso
          const successUrl = new URL('/checkout/success', window.location.origin);
          successUrl.searchParams.set('checkoutId', response.checkoutId);
          
          // Atualizar return_url no checkout se possível
          console.log('✅ Checkout criado:', {
            checkoutId: response.checkoutId,
            checkoutUrl: response.checkoutUrl,
            successUrl: successUrl.toString()
          });
        }
        
        // Redireciona automaticamente após 2 segundos (reduzido para melhor UX)
        setTimeout(() => {
          if (response.checkoutUrl) {
            // Redirecionar para página de pagamento do PagBank
            window.location.href = response.checkoutUrl;
          }
        }, 2000);
      } else {
        // Melhorar mensagens de erro
        let errorMessage = 'Erro ao criar checkout';
        if (response.error) {
          errorMessage = response.error;
        } else if (response.errors && response.errors.length > 0) {
          errorMessage = response.errors.map((e: any) => e.message || e.code).join(', ');
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestData = () => {
    setFormData({
      email: TEST_CUSTOMER_DATA.email,
      name: TEST_CUSTOMER_DATA.name,
      country: "Brasil",
      address: TEST_CUSTOMER_DATA.address,
      taxId: TEST_CUSTOMER_DATA.taxId,
      phone: TEST_CUSTOMER_DATA.phone,
      billingSameAsShipping: true
    });
  };

  return (
    <div className="checkout-page">
      <div className="background-overlay" />
      
      <header className="checkout-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <div className="logo-container">
          <div className="logo-icon">
            <img
              src={logo}
              alt="Logo Tudo Sobre Palmilhas"
              style={{
                filter: 'brightness(0) saturate(100%)',
                width: '60px',
                height: '60px',
                objectFit: 'contain'
              }}
            />
          </div>
          <span className="logo-text">Podostore</span>
        </div>
        
        <div className="test-mode-badge">
          MODO TESTE
          <button 
            className="test-data-btn"
            onClick={fillTestData}
            type="button"
          >
            Preencher Dados de Teste
          </button>
        </div>
      </header>

      <div className="checkout-content">
        <div className="order-summary">
          <div className="order-header">
            <h2>Resumo do Pedido</h2>
            <div className="total-amount">
              <span>Pagar Podostore</span>
              <div className="amount">R$ 99,99</div>
            </div>
          </div>

          <div className="product-list">
            <div className="product-item">
              <div className="product-image">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div className="product-details">
                <div className="product-name">Plano Profissional</div>
                <div className="product-quantity">Qtd 1</div>
                <div className="product-price">R$ 99,99</div>
              </div>
            </div>
          </div>

          <div className="cost-breakdown">
            <div className="cost-item">
              <span>Subtotal</span>
              <span>R$ 99,99</span>
            </div>
            <div className="cost-item">
              <span>Frete</span>
              <span>R$ 0,00</span>
            </div>
            <div className="cost-item total">
              <span>Total</span>
              <span>R$ 99,99</span>
            </div>
          </div>
        </div>

        <div className="payment-form">
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '12px',
                marginBottom: '16px',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '4px',
                color: '#c33'
              }}>
                {error}
              </div>
            )}

            <div className="payment-info">
              <div className="info-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <div>
                  <h4>Pagamento Seguro</h4>
                  <p>Você será redirecionado para a página segura do PagBank para completar o pagamento.</p>
                  <p>Métodos disponíveis: Cartão, PIX, Boleto</p>
                  <p style={{ marginTop: '0.5rem', color: '#21a1a0', fontWeight: 500 }}>
                    💡 Certifique-se de preencher o telefone com DDD
                  </p>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Informações de Entrega</h3>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">Nome completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="taxId">CPF/CNPJ</label>
                <input
                  type="text"
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={(e) => {
                    const formatted = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, taxId: formatted }));
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Telefone (com DDD)</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setFormData(prev => ({ ...prev, phone: formatted }));
                  }}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  required
                />
              </div>
            </div>

            {checkoutUrl && (
              <div className="checkout-redirect">
                <div className="redirect-info">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#21a1a0" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <div>
                    <h3>Checkout Criado!</h3>
                    <p>Você será redirecionado em 3 segundos...</p>
                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                      Clique aqui se não for redirecionado
                    </a>
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="pay-button"
              disabled={isLoading}
            >
              {isLoading ? 'Criando checkout...' : `Continuar para Pagamento - R$ 99,99`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
