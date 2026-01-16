import React, { useState } from "react";
import "./FAQ.css";

const FAQ: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "Como funciona a avaliação postural digital?",
      answer: "Nosso sistema permite que você faça upload de fotos do paciente e marque pontos anatômicos específicos. A inteligência artificial auxilia na análise, gerando relatórios detalhados com medições precisas e sugestões de tratamento."
    },
    {
      question: "Posso usar a plataforma em qualquer dispositivo?",
      answer: "Sim! A plataforma é totalmente responsiva e funciona em computadores, tablets e smartphones. Você pode acessar de qualquer lugar com conexão à internet, garantindo flexibilidade no seu atendimento."
    },
    {
      question: "Os dados dos pacientes ficam seguros?",
      answer: "Absolutamente. Utilizamos criptografia de ponta a ponta e seguimos todas as normas da LGPD. Nossos servidores são certificados e os dados são armazenados com máxima segurança, garantindo total privacidade das informações."
    },
    {
      question: "Como funciona a integração com laboratórios?",
      answer: "Nosso sistema permite enviar especificações técnicas das palmilhas diretamente para laboratórios parceiros. Você pode acompanhar o status de produção em tempo real e receber notificações quando estiverem prontas."
    },
    {
      question: "Existe suporte técnico disponível?",
      answer: "Sim! Oferecemos suporte via chat, email e WhatsApp durante horário comercial. Para planos profissionais e clínicas, disponibilizamos suporte prioritário e treinamentos personalizados."
    },
    {
      question: "Posso importar dados de outras plataformas?",
      answer: "Oferecemos ferramentas de importação para os principais sistemas do mercado. Nossa equipe técnica pode auxiliar na migração dos seus dados de forma segura e organizada."
    },
    {
      question: "Como funciona o período de teste gratuito?",
      answer: "Você tem 30 dias completos para testar todas as funcionalidades da plataforma sem nenhum custo. Não é necessário cartão de crédito para começar, e você pode cancelar a qualquer momento."
    },
    {
      question: "A plataforma gera relatórios personalizados?",
      answer: "Sim! Você pode personalizar completamente os relatórios com sua logo, informações da clínica e adaptar o conteúdo conforme sua especialidade. Também oferecemos templates pré-definidos para diferentes tipos de avaliação."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section id="faq" className="faq-section">
      <div className="faq-container">
        <div className="faq-header">
          

          <h2 className="faq-title">
            Perguntas Frequentes
          </h2>

          <p className="faq-description">
            Tire suas dúvidas sobre a plataforma e descubra como ela pode transformar sua prática clínica.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${openFAQ === index ? 'open' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
              >
                <span className="question-text">{faq.question}</span>
                <span className="question-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </span>
              </button>

              <div className="faq-answer">
                <div className="answer-content">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

       
      </div>
    </section>
  );
};

export default FAQ;

