import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./StickyFooter.css";

const StickyFooter: React.FC = () => {
  const navigate = useNavigate();
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const isNearBottom = scrollTop + windowHeight >= documentHeight - 100;

          setIsAtBottom(isNearBottom);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <AnimatePresence>
      {isAtBottom && (
        <motion.div
          className="sticky-footer"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="footer-content">
            <motion.div
              className="footer-nav"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <ul className="nav-column">
                <li>
                  <button 
                    className="nav-link"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    Início
                  </button>
                </li>
                <li>
                  <button 
                    className="nav-link"
                    onClick={() => scrollToSection("features")}
                  >
                    Funcionalidades
                  </button>
                </li>
                <li>
                  <button 
                    className="nav-link"
                    onClick={() => scrollToSection("pricing")}
                  >
                    Preços
                  </button>
                </li>
              </ul>
              <ul className="nav-column">
                <li>
                  <button 
                    className="nav-link"
                    onClick={() => navigate("/login")}
                  >
                    Entrar
                  </button>
                </li>
                <li>
                  <button 
                    className="nav-link"
                    onClick={() => navigate("/register")}
                  >
                    Cadastrar
                  </button>
                </li>
                <li>
                  <button 
                    className="nav-link"
                    onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
                  >
                    Suporte
                  </button>
                </li>
              </ul>
            </motion.div>
            
            <motion.h2
              className="footer-logo"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Posturo Science
            </motion.h2>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyFooter;

