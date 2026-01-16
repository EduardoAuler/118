import React from "react";
import "./Testimonials.css";

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Dr. Marina Santos",
      username: "@dra.marina.fisio",
      body: "O Posturo Science revolucionou minha prática clínica. As avaliações posturais ficaram muito mais precisas e os relatórios impressionam os pacientes.",
      img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      specialty: "Fisioterapeuta"
    },
    {
      name: "Dr. Carlos Mendes",
      username: "@dr.carlosmendes",
      body: "A ferramenta de design de palmilhas é fantástica. Consigo criar soluções personalizadas em minutos, algo que antes levava horas.",
      img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
      specialty: "Podólogo"
    },
    {
      name: "Dra. Ana Rodrigues",
      username: "@ana.podologo",
      body: "Meus pacientes ficam impressionados com a qualidade dos relatórios. A plataforma elevou o nível de profissionalismo da minha clínica.",
      img: "https://images.unsplash.com/photo-1594824475210-52f8b9675de9?w=150&h=150&fit=crop&crop=face",
      specialty: "Podóloga"
    },
    {
      name: "Dr. Roberto Silva",
      username: "@roberto.orto",
      body: "A integração com o laboratório facilitou muito meu trabalho. Agora posso acompanhar todo o processo de produção das palmilhas.",
      img: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
      specialty: "Ortopedista"
    },
    {
      name: "Dra. Juliana Costa",
      username: "@ju.fisioterapeuta",
      body: "O sistema de gestão de pacientes é excelente. Tenho todo o histórico organizado e posso acompanhar a evolução de cada paciente.",
      img: "https://images.unsplash.com/photo-1551601651-dec45da1c85c?w=150&h=150&fit=crop&crop=face",
      specialty: "Fisioterapeuta"
    },
    {
      name: "Dr. Pedro Oliveira",
      username: "@pedro.medesportiva",
      body: "Para medicina esportiva, a plataforma é perfeita. Consigo avaliar atletas com precisão e criar palmilhas específicas para cada modalidade.",
      img: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=150&h=150&fit=crop&crop=face",
      specialty: "Med. Esportiva"
    },
    {
      name: "Dra. Fernanda Lima",
      username: "@fernanda.podo",
      body: "A inteligência artificial da plataforma me ajuda muito no diagnóstico. Agora tenho mais confiança nas minhas avaliações.",
      img: "https://images.unsplash.com/photo-1563237023-b1e970526dcb?w=150&h=150&fit=crop&crop=face",
      specialty: "Podóloga"
    },
    {
      name: "Dr. Marcos Ferreira",
      username: "@marcos.fisio",
      body: "O suporte da equipe é excepcional. Sempre que preciso de ajuda, eles respondem rapidamente e resolvem qualquer dúvida.",
      img: "https://images.unsplash.com/photo-1590031905406-f18a426d772d?w=150&h=150&fit=crop&crop=face",
      specialty: "Fisioterapeuta"
    },
    {
      name: "Dra. Camila Santos",
      username: "@camila.clinicapos",
      body: "Como diretora de clínica, vejo o impacto positivo que a plataforma trouxe para toda nossa equipe. A produtividade aumentou significativamente.",
      img: "https://images.unsplash.com/photo-1582233479366-6d38bc390a08?w=150&h=150&fit=crop&crop=face",
      specialty: "Diretora Clínica"
    }
  ];

  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = testimonials.slice(6, 9);

  const TestimonialCard = ({ img, name, username, body, specialty }: {
    img: string;
    name: string;
    username: string;
    body: string;
    specialty: string;
  }) => {
    return (
      <div className="testimonial-card">
        <div className="testimonial-decoration" />
        
        <div className="testimonial-body">
          {body}
        </div>

        <div className="testimonial-author">
          <img 
            src={img || "/placeholder.svg"} 
            alt={name} 
            className="author-avatar"
          />
          <div className="author-info">
            <div className="author-name">{name}</div>
            <div className="author-username">{username}</div>
            <div className="author-specialty">{specialty}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <button className="testimonials-badge">
            <div className="badge-gradient-top" />
            <div className="badge-gradient-bottom" />
            <span>Depoimentos</span>
          </button>
          
          <h2 className="testimonials-title">
            O que nossos usuários dizem
          </h2>

          <p className="testimonials-description">
            De avaliações intuitivas a recursos poderosos, nossa plataforma se tornou uma ferramenta essencial para profissionais de saúde ao redor do país.
          </p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonials-column">
            {firstColumn.map((testimonial) => (
              <TestimonialCard key={testimonial.username} {...testimonial} />
            ))}
          </div>

          <div className="testimonials-column hidden-mobile">
            {secondColumn.map((testimonial) => (
              <TestimonialCard key={testimonial.username} {...testimonial} />
            ))}
          </div>

          <div className="testimonials-column hidden-tablet">
            {thirdColumn.map((testimonial) => (
              <TestimonialCard key={testimonial.username} {...testimonial} />
            ))}
          </div>
        </div>

        
      </div>
    </section>
  );
};

export default Testimonials;










