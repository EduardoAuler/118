import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import "./Features.css";

const Features: React.FC = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const ref = useRef(null);

  const features = [
    {
      id: 1,
      title: "Avaliação Postural Digital",
      description: "Sistema avançado de análise postural com marcação de pontos anatômicos e geração automática de relatórios detalhados.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      title: "Editor de Palmilhas 3D",
      description: "Ferramenta intuitiva para design de palmilhas ortopédicas personalizadas com visualização em tempo real.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 22h20L12 2z"/>
          <path d="M12 6v10"/>
          <path d="M8 14h8"/>
        </svg>
      ),
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      title: "Gestão de Pacientes",
      description: "Sistema completo de prontuário eletrônico com histórico de consultas e acompanhamento evolutivo.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      gradient: "from-green-500 to-emerald-500"
    },
    {
      id: 4,
      title: "IA para Diagnósticos",
      description: "Inteligência artificial que auxilia na análise de padrões posturais e sugestões de tratamento baseadas em evidências.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a3 3 0 0 0-3 3c0 1 0 3 1.5 4 1.5 1 1.5 3 0 4C9 14 9 16 10.5 17c1.5 1 1.5 3 0 4a3 3 0 1 0 3-3"/>
          <path d="M9 12h.01"/>
          <path d="M15 8h.01"/>
          <path d="M12 16h.01"/>
        </svg>
      ),
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section id="features" className="features-section">
      {/* Background decorations */}
      <div className="features-bg-decoration" />
      <div className="features-divider" />
      
      <div ref={ref} className="features-container">
        <h2 className="features-title">
          Funcionalidades
        </h2>

        <div className="features-wrapper">
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                className={`feature-card ${hoveredFeature === feature.id ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                                  <div className="feature-content">
                    <div className="feature-header">
                      <motion.div 
                        className={`feature-icon bg-gradient-to-r ${feature.gradient}`}
                        whileHover={{ 
                          scale: 1.1,
                          rotate: 5,
                          transition: { duration: 0.2 }
                        }}
                      >
                        {feature.icon}
                      </motion.div>
                      <motion.h3 
                        className="feature-title"
                        whileHover={{ 
                          x: 5,
                          transition: { duration: 0.2 }
                        }}
                      >
                        {feature.title}
                      </motion.h3>
                    </div>
                  
                  <p className="feature-description">
                    {feature.description}
                  </p>

                  {/* Interactive demo area */}
                  <div className="feature-demo">
                    {feature.id === 1 && (
                      <div className="demo-postural">
                        <motion.div 
                          className="demo-body"
                          animate={{
                            rotateY: hoveredFeature === 1 ? 5 : 0,
                            rotateX: hoveredFeature === 1 ? -2 : 0
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="body-outline">
                            <svg width="80" height="160" viewBox="0 0 80 160" fill="none">
                              {/* Cabeça */}
                              <circle cx="40" cy="20" r="12" stroke="currentColor" strokeWidth="2" fill="rgba(59, 130, 246, 0.1)"/>
                              {/* Tronco */}
                              <rect x="30" y="32" width="20" height="40" rx="10" stroke="currentColor" strokeWidth="2" fill="rgba(59, 130, 246, 0.1)"/>
                              {/* Braços */}
                              <path d="M30 40 Q20 45 15 50 Q10 55 15 60" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <path d="M50 40 Q60 45 65 50 Q70 55 65 60" stroke="currentColor" strokeWidth="2" fill="none"/>
                              {/* Pernas */}
                              <path d="M30 72 Q25 80 20 90 Q15 100 20 110" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <path d="M50 72 Q55 80 60 90 Q65 100 60 110" stroke="currentColor" strokeWidth="2" fill="none"/>
                              {/* Pés */}
                              <ellipse cx="20" cy="120" rx="8" ry="4" stroke="currentColor" strokeWidth="2" fill="rgba(59, 130, 246, 0.1)"/>
                              <ellipse cx="60" cy="120" rx="8" ry="4" stroke="currentColor" strokeWidth="2" fill="rgba(59, 130, 246, 0.1)"/>
                            </svg>
                          </div>
                          
                          {hoveredFeature === 1 && (
                            <>
                              {/* Pontos de referência anatômicos */}
                              <motion.div 
                                className="anatomical-point"
                                style={{top: '12%', left: '50%'}}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                              >
                                <div className="point-label">C7</div>
                              </motion.div>
                              
                              <motion.div 
                                className="anatomical-point"
                                style={{top: '25%', left: '50%'}}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                              >
                                <div className="point-label">T12</div>
                              </motion.div>
                              
                              <motion.div 
                                className="anatomical-point"
                                style={{top: '45%', left: '50%'}}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                              >
                                <div className="point-label">L5</div>
                              </motion.div>
                              
                              <motion.div 
                                className="anatomical-point"
                                style={{top: '65%', left: '35%'}}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.4 }}
                              >
                                <div className="point-label">Joelho E</div>
                              </motion.div>
                              
                              <motion.div 
                                className="anatomical-point"
                                style={{top: '65%', left: '65%'}}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                              >
                                <div className="point-label">Joelho D</div>
                              </motion.div>
                              
                              <motion.div 
                                className="anatomical-point"
                                style={{top: '85%', left: '35%'}}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.4 }}
                              >
                                <div className="point-label">Tornozelo E</div>
                              </motion.div>
                              
                              <motion.div 
                                className="anatomical-point"
                                style={{top: '85%', left: '65%'}}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.4 }}
                              >
                                <div className="point-label">Tornozelo D</div>
                              </motion.div>
                              
                              {/* Linhas de medição */}
                              <motion.div 
                                className="measurement-line"
                                style={{top: '15%', left: '50%', height: '30%'}}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                              />
                              
                              <motion.div 
                                className="measurement-line"
                                style={{top: '45%', left: '50%', height: '20%'}}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: 0.9, duration: 0.6 }}
                              />
                            </>
                          )}
                        </motion.div>
                      </div>
                    )}

                    {feature.id === 2 && (
                      <div className="demo-palmilha">
                        <motion.div 
                          className="palmilha-container"
                          animate={{
                            rotateY: hoveredFeature === 2 ? 15 : 0,
                            rotateX: hoveredFeature === 2 ? -10 : 0
                          }}
                          transition={{ duration: 0.6 }}
                        >
                          <div className="palmilha-outline">
                            <svg width="100" height="140" viewBox="0 0 100 140" fill="none">
                              {/* Contorno da palmilha */}
                              <path 
                                d="M50 10 C60 10, 70 15, 75 25 C80 35, 80 45, 75 55 C70 65, 65 75, 60 85 C55 95, 50 105, 45 110 C40 115, 35 110, 30 105 C25 100, 20 90, 20 80 C20 70, 25 60, 30 50 C35 40, 40 30, 45 20 C45 15, 47 12, 50 10 Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="rgba(147, 51, 234, 0.1)"
                              />
                              
                              {/* Arco plantar */}
                              <path 
                                d="M30 60 Q50 50 70 60"
                                stroke="rgba(147, 51, 234, 0.6)"
                                strokeWidth="3"
                                fill="none"
                                strokeDasharray="5,5"
                              />
                              
                              {/* Metatarsos */}
                              <circle cx="25" cy="90" r="3" fill="rgba(147, 51, 234, 0.4)"/>
                              <circle cx="35" cy="88" r="3" fill="rgba(147, 51, 234, 0.4)"/>
                              <circle cx="45" cy="86" r="3" fill="rgba(147, 51, 234, 0.4)"/>
                              <circle cx="55" cy="88" r="3" fill="rgba(147, 51, 234, 0.4)"/>
                              <circle cx="65" cy="90" r="3" fill="rgba(147, 51, 234, 0.4)"/>
                              <circle cx="75" cy="92" r="3" fill="rgba(147, 51, 234, 0.4)"/>
                            </svg>
                          </div>
                          
                          {hoveredFeature === 2 && (
                            <>
                              {/* Suporte do arco */}
                              <motion.div 
                                className="palmilha-component"
                                style={{top: '35%', left: '50%', background: 'linear-gradient(45deg, #8b5cf6, #a78bfa)'}}
                                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.5 }}
                              >
                                <div className="component-label">Arco</div>
                              </motion.div>
                              
                              {/* Suporte do calcanhar */}
                              <motion.div 
                                className="palmilha-component"
                                style={{top: '70%', left: '50%', background: 'linear-gradient(45deg, #a78bfa, #c4b5fd)'}}
                                initial={{ scale: 0, rotate: 180, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                              >
                                <div className="component-label">Calcanhar</div>
                              </motion.div>
                              
                              {/* Suporte metatarsal */}
                              <motion.div 
                                className="palmilha-component"
                                style={{top: '55%', left: '50%', background: 'linear-gradient(45deg, #c4b5fd, #ddd6fe)'}}
                                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                              >
                                <div className="component-label">Metatarsal</div>
                              </motion.div>
                              
                              {/* Linhas de medição */}
                              <motion.div 
                                className="palmilha-measurement"
                                style={{top: '40%', left: '50%', height: '30%'}}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                              />
                              
                              {/* Indicadores de pressão */}
                              <motion.div 
                                className="pressure-indicator"
                                style={{top: '25%', left: '30%'}}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                              />
                              <motion.div 
                                className="pressure-indicator"
                                style={{top: '25%', left: '70%'}}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.6, duration: 0.4 }}
                              />
                              <motion.div 
                                className="pressure-indicator"
                                style={{top: '60%', left: '50%'}}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.7, duration: 0.4 }}
                              />
                            </>
                          )}
                        </motion.div>
                      </div>
                    )}

                    {feature.id === 3 && (
                      <div className="demo-pacientes">
                        <motion.div 
                          className="patient-dashboard"
                          animate={{
                            scale: hoveredFeature === 3 ? 1.02 : 1
                          }}
                          transition={{ duration: 0.4 }}
                        >
                          <div className="dashboard-header">
                            <motion.div 
                              className="dashboard-title"
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: hoveredFeature === 3 ? 1 : 0, y: hoveredFeature === 3 ? 0 : -20 }}
                              transition={{ delay: 0.1, duration: 0.3 }}
                            >
                              Prontuários Ativos
                            </motion.div>
                            <motion.div 
                              className="patient-count"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: hoveredFeature === 3 ? 1 : 0, scale: hoveredFeature === 3 ? 1 : 0 }}
                              transition={{ delay: 0.2, duration: 0.3 }}
                            >
                              127
                            </motion.div>
                          </div>
                          
                          <div className="patient-list">
                            {hoveredFeature === 3 && (
                              <>
                                <motion.div 
                                  className="patient-card"
                                  initial={{ x: -100, opacity: 0, rotateY: -90 }}
                                  animate={{ x: 0, opacity: 1, rotateY: 0 }}
                                  transition={{ delay: 0.3, duration: 0.5 }}
                                >
                                  <div className="patient-avatar">
                                    <div className="avatar-circle" />
                                    <div className="status-indicator online" />
                                  </div>
                                  <div className="patient-info">
                                    <div className="patient-name">Maria Silva</div>
                                    <div className="patient-details">Consulta: 15/12/2024</div>
                                    <div className="patient-status">Avaliação Pendente</div>
                                  </div>
                                  <div className="patient-actions">
                                    <div className="action-btn">Ver</div>
                                  </div>
                                </motion.div>
                                
                                <motion.div 
                                  className="patient-card"
                                  initial={{ x: -100, opacity: 0, rotateY: -90 }}
                                  animate={{ x: 0, opacity: 1, rotateY: 0 }}
                                  transition={{ delay: 0.4, duration: 0.5 }}
                                >
                                  <div className="patient-avatar">
                                    <div className="avatar-circle" />
                                    <div className="status-indicator offline" />
                                  </div>
                                  <div className="patient-info">
                                    <div className="patient-name">João Santos</div>
                                    <div className="patient-details">Consulta: 14/12/2024</div>
                                    <div className="patient-status">Palmilha Pronta</div>
                                  </div>
                                  <div className="patient-actions">
                                    <div className="action-btn">Ver</div>
                                  </div>
                                </motion.div>
                                
                                <motion.div 
                                  className="patient-card"
                                  initial={{ x: -100, opacity: 0, rotateY: -90 }}
                                  animate={{ x: 0, opacity: 1, rotateY: 0 }}
                                  transition={{ delay: 0.5, duration: 0.5 }}
                                >
                                  <div className="patient-avatar">
                                    <div className="avatar-circle" />
                                    <div className="status-indicator online" />
                                  </div>
                                  <div className="patient-info">
                                    <div className="patient-name">Ana Costa</div>
                                    <div className="patient-details">Consulta: 13/12/2024</div>
                                    <div className="patient-status">Em Tratamento</div>
                                  </div>
                                  <div className="patient-actions">
                                    <div className="action-btn">Ver</div>
                                  </div>
                                </motion.div>
                              </>
                            )}
                          </div>
                          
                          <motion.div 
                            className="dashboard-footer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: hoveredFeature === 3 ? 1 : 0, y: hoveredFeature === 3 ? 0 : 20 }}
                            transition={{ delay: 0.6, duration: 0.3 }}
                          >
                            <div className="stats">
                              <div className="stat-item">
                                <span className="stat-number">89%</span>
                                <span className="stat-label">Satisfação</span>
                              </div>
                              <div className="stat-item">
                                <span className="stat-number">24h</span>
                                <span className="stat-label">Tempo Médio</span>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>
                    )}

                    {feature.id === 4 && (
                      <div className="demo-ia">
                        <motion.div 
                          className="ai-interface"
                          animate={{
                            rotateY: hoveredFeature === 4 ? 10 : 0,
                            rotateX: hoveredFeature === 4 ? -5 : 0
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="ai-brain">
                            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                              {/* Cérebro principal */}
                              <path 
                                d="M60 20 C80 20, 90 30, 90 40 C90 50, 85 60, 80 70 C75 80, 70 85, 60 85 C50 85, 45 80, 40 70 C35 60, 30 50, 30 40 C30 30, 40 20, 60 20 Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="rgba(251, 146, 60, 0.1)"
                              />
                              
                              {/* Hemisférios cerebrais */}
                              <path d="M60 25 Q70 30 75 40" stroke="rgba(251, 146, 60, 0.6)" strokeWidth="1" fill="none"/>
                              <path d="M60 25 Q50 30 45 40" stroke="rgba(251, 146, 60, 0.6)" strokeWidth="1" fill="none"/>
                              <path d="M60 35 Q70 45 75 55" stroke="rgba(251, 146, 60, 0.6)" strokeWidth="1" fill="none"/>
                              <path d="M60 35 Q50 45 45 55" stroke="rgba(251, 146, 60, 0.6)" strokeWidth="1" fill="none"/>
                              <path d="M60 45 Q70 55 75 65" stroke="rgba(251, 146, 60, 0.6)" strokeWidth="1" fill="none"/>
                              <path d="M60 45 Q50 55 45 65" stroke="rgba(251, 146, 60, 0.6)" strokeWidth="1" fill="none"/>
                            </svg>
                          </div>
                          
                          {hoveredFeature === 4 && (
                            <>
                              {/* Neurônios ativos */}
                              <motion.div 
                                className="neuron"
                                style={{top: '25%', left: '30%'}}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                              >
                                <div className="neuron-pulse" />
                                <div className="neuron-label">Análise</div>
                              </motion.div>
                              
                              <motion.div 
                                className="neuron"
                                style={{top: '25%', left: '70%'}}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                              >
                                <div className="neuron-pulse" />
                                <div className="neuron-label">Padrões</div>
                              </motion.div>
                              
                              <motion.div 
                                className="neuron"
                                style={{top: '45%', left: '50%'}}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                              >
                                <div className="neuron-pulse" />
                                <div className="neuron-label">Diagnóstico</div>
                              </motion.div>
                              
                              <motion.div 
                                className="neuron"
                                style={{top: '65%', left: '35%'}}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.4 }}
                              >
                                <div className="neuron-pulse" />
                                <div className="neuron-label">Tratamento</div>
                              </motion.div>
                              
                              <motion.div 
                                className="neuron"
                                style={{top: '65%', left: '65%'}}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                              >
                                <div className="neuron-pulse" />
                                <div className="neuron-label">Resultados</div>
                              </motion.div>
                              
                              {/* Conexões neurais */}
                              <motion.div 
                                className="neural-connection"
                                style={{top: '30%', left: '50%', width: '40%', height: '2px'}}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.6, duration: 0.6 }}
                              />
                              
                              <motion.div 
                                className="neural-connection"
                                style={{top: '50%', left: '50%', width: '30%', height: '2px', transform: 'rotate(-45deg)'}}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.7, duration: 0.6 }}
                              />
                              
                              <motion.div 
                                className="neural-connection"
                                style={{top: '50%', left: '50%', width: '30%', height: '2px', transform: 'rotate(45deg)'}}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                              />
                              
                              {/* Dados processados */}
                              <motion.div 
                                className="data-stream"
                                style={{top: '10%', left: '50%'}}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9, duration: 0.4 }}
                              >
                                <div className="data-point" />
                                <div className="data-point" />
                                <div className="data-point" />
                                <div className="data-point" />
                                <div className="data-point" />
                              </motion.div>
                              
                              <motion.div 
                                className="accuracy-meter"
                                style={{top: '85%', left: '50%'}}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 1.0, duration: 0.4 }}
                              >
                                <div className="accuracy-bar">
                                  <motion.div 
                                    className="accuracy-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: '94%' }}
                                    transition={{ delay: 1.1, duration: 0.8 }}
                                  />
                                </div>
                                <div className="accuracy-text">94% Precisão</div>
                              </motion.div>
                            </>
                          )}
                        </motion.div>
                      </div>
                    )}
                  </div>

                  <motion.div 
                    className="feature-actions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: hoveredFeature === feature.id ? 1 : 0,
                      y: hoveredFeature === feature.id ? 0 : 10
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.button 
                      className="feature-button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Saiba Mais
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 17l10-10"/>
                        <path d="M7 7h10v10"/>
                      </svg>
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;

