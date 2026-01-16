import React from "react";
import { useNavigate } from "react-router-dom";
import "./Pricing.css";

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  const pricingPlans = [
    {
      name: "Profissional",
      price: 99.99,
      description: "Acesso vitalício a todos os recursos da plataforma",
      features: [
        "Avaliações ilimitadas",
        "Relatórios avançados com IA",
        "Suporte prioritário",
        "Armazenamento ilimitado",
        "Editor de palmilhas completo",
        "Integração com laboratórios",
        "Múltiplos usuários",
        "Dashboard gerencial",
        "Relatórios personalizados",
        "API para integrações",
        "Suporte dedicado"
      ],
      popular: true,
      cta: "Comprar Agora",
      disabled: false,
      isLifetime: true
    }
  ];

  const handlePlanClick = (plan: any) => {
    if (plan.name === "Profissional") {
      navigate("/checkout");
    }
  };

  return (
    <section className="pricing-section">
      <div className="pricing-container">
        {/* Header */}
        <div className="pricing-header">
         

          <h2 className="pricing-title">
            Escolha seu plano
          </h2>

          <p className="pricing-description">
            Comece a transformar sua prática clínica hoje. Acesso vitalício a todos os recursos.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-grid">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.name}
              className={`pricing-card ${plan.popular ? 'popular' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="popular-badge">
                  Mais Popular
                </div>
              )}

              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  {plan.isLifetime ? (
                    <>
                      <span className="price-currency">R$</span>
                      <span className="price-amount">{plan.price}</span>
                      <span className="price-period">vitalício</span>
                    </>
                  ) : typeof plan.price === "string" ? (
                    <span className="price-free">{plan.price}</span>
                  ) : (
                    <>
                      <span className="price-currency">R$</span>
                      <span className="price-amount">{plan.price}</span>
                      <span className="price-period">/mês</span>
                    </>
                  )}
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="feature-item">
                    <svg className="feature-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanClick(plan)}
                className={`plan-cta ${plan.popular ? 'popular' : ''}`}
                disabled={plan.disabled}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="pricing-bottom">
          <p className="bottom-text">Precisa de uma solução personalizada? Estamos aqui para ajudar.</p>
          <button 
            className="contact-btn"
            onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
          >
            Falar com nossa equipe →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;










