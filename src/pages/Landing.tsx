import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";
import logo from "../assets/Podostore/Logo/Branco/Assinatura Visual_Tudo Sobre Palmilhas (branco).png";

// Componentes das seções
import Hero from "../components/landing/Hero";
import FAQ from "../components/landing/FAQ";
import Features from "../components/landing/Features";
import Pricing from "../components/landing/Pricing";
import StickyFooter from "../components/landing/StickyFooter";
import Testimonials from "../components/landing/Testimonials";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMobileNavClick = (elementId: string) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        const headerOffset = 120;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const scrollToSection = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="landing-page">
      {/* Pearl Mist Background with Top Glow */}
      <div className="background-overlay" />

      {/* Desktop Header */}
      <header className={`header-desktop ${isScrolled ? "scrolled" : ""}`}>
        <a
          className={`logo-container ${isScrolled ? "scrolled" : ""}`}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div className="logo-icon">
            <img
              src={logo}
              alt="Logo Tudo Sobre Palmilhas"
              style={{
                filter: 'brightness(0) saturate(100%)',
                width: '80px',
                height: '80px',
                objectFit: 'contain'
              }}
            />
          </div>
        </a>

        <nav className="nav-menu">
          <button
            className="nav-link"
            onClick={() => scrollToSection("features")}
          >
            Funcionalidades
          </button>
          <button
            className="nav-link"
            onClick={() => scrollToSection("pricing")}
          >
            Preços
          </button>
          <button
            className="nav-link"
            onClick={() => scrollToSection("testimonials")}
          >
            Depoimentos
          </button>
          <button
            className="nav-link"
            onClick={() => scrollToSection("faq")}
          >
            FAQ
          </button>
        </nav>

        <div className="header-actions">
          <button
            className="login-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Botão Entrar clicado");
              navigate("/login");
            }}
          >
            Entrar
          </button>
          <button
            className="signup-btn"
            onClick={() => navigate("/register")}
          >
            Cadastrar
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="header-mobile">
        <a
          className="logo-container"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div className="logo-icon">
            <img
              src={logo}
              alt="Logo Tudo Sobre Palmilhas"
              style={{
                filter: 'brightness(0) saturate(100%)',
                width: '50px',
                height: '50px',
                objectFit: 'contain'
              }}
            />
          </div>
        </a>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="mobile-menu-button"
          aria-label="Toggle menu"
        >
          <div className="hamburger">
            <span className={isMobileMenuOpen ? "open" : ""}></span>
            <span className={isMobileMenuOpen ? "open" : ""}></span>
            <span className={isMobileMenuOpen ? "open" : ""}></span>
          </div>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-content">
            <nav className="mobile-nav">
              <button
                onClick={() => handleMobileNavClick("features")}
                className="mobile-nav-link"
              >
                Funcionalidades
              </button>
              <button
                onClick={() => handleMobileNavClick("pricing")}
                className="mobile-nav-link"
              >
                Preços
              </button>
              <button
                onClick={() => handleMobileNavClick("testimonials")}
                className="mobile-nav-link"
              >
                Depoimentos
              </button>
              <button
                onClick={() => handleMobileNavClick("faq")}
                className="mobile-nav-link"
              >
                FAQ
              </button>
              <div className="mobile-actions">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Botão Entrar mobile clicado");
                    navigate("/login");
                  }}
                  className="mobile-login-btn"
                >
                  Entrar
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="mobile-signup-btn"
                >
                  Cadastrar
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <div id="features">
        <Features />
      </div>

      {/* Pricing Section */}
      <div id="pricing">
        <Pricing />
      </div>

      {/* Testimonials Section */}
      <div id="testimonials">
        <Testimonials />
      </div>

      {/* FAQ Section */}
      <div id="faq">
        <FAQ />
      </div>

      {/* Sticky Footer */}
      <StickyFooter />
    </div>
  );
};

export default Landing;


