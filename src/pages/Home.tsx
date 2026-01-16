import {
  Assessment,
  Dashboard,
  EventNote,
  LocalShipping,
  Menu,
  Notifications,
  Person,
  Search,
} from "@mui/icons-material";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { motion, useScroll, useTransform } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/firebaseconfig";
import "../styles/Home.scss";

const featuredServices = [
  {
    id: 1,
    name: "Avaliação Postural",
    description: "Análise completa com registro detalhado de pontos anatômicos",
    image: "https://source.unsplash.com/random/300x200/?posture-assessment",
    icon: <Assessment fontSize="large" />,
  },
  {
    id: 2,
    name: "Design de Palmilhas",
    description: "Criação personalizada com base na biomecânica do paciente",
    image: "https://source.unsplash.com/random/300x200/?foot-orthotics",
    icon: <Dashboard fontSize="large" />,
  },
  {
    id: 3,
    name: "Gestão de Pedidos",
    description: "Acompanhamento detalhado do processo de fabricação",
    image: "https://source.unsplash.com/random/300x200/?order-management",
    icon: <LocalShipping fontSize="large" />,
  },
  {
    id: 4,
    name: "Histórico Clínico",
    description: "Registro completo do prontuário do paciente",
    image: "https://source.unsplash.com/random/300x200/?medical-record",
    icon: <EventNote fontSize="large" />,
  },
];

const processSteps = [
  {
    id: 1,
    name: "Avaliação Clínica",
    description: "Registro detalhado de pontos anatômicos e testes clínicos",
    image: "https://source.unsplash.com/random/400x300/?clinical-assessment",
  },
  {
    id: 2,
    name: "Design Digital",
    description: "Criação personalizada com precisão milimétrica",
    image: "https://source.unsplash.com/random/400x300/?digital-design",
  },
  {
    id: 3,
    name: "Fabricação",
    description: "Produção com materiais de alta qualidade",
    image: "https://source.unsplash.com/random/400x300/?manufacturing",
  },
  {
    id: 4,
    name: "Entrega & Acompanhamento",
    description: "Rastreamento completo até a chegada ao paciente",
    image: "https://source.unsplash.com/random/400x300/?delivery-tracking",
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (user) {
        // Usuário está autenticado
        setUserName(user.displayName || user.email?.split("@")[0] || "Usuário");
        // Redirecionar para listagem de pacientes
        navigate("/patient-list");
      } else {
        // Usuário não está autenticado, redirecionar para login
        navigate("/login");
      }
    });

    // Limpar inscrição ao desmontar o componente
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Limpar dados de autenticação
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('tenantId');
      sessionStorage.clear();
      // Redirecionar para a landing page (tela inicial)
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Mesmo com erro, redireciona para a landing page
      navigate("/");
    }
  };

  // Mostrar tela de carregamento enquanto verifica a autenticação
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h5">Carregando...</Typography>
      </Box>
    );
  }

  const navigateToInsoleEditor = (footId: string) => {
    navigate(`/insole-editor/${footId}`);
  };

  return (
    <div className="home-page">
      <motion.div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          opacity: headerOpacity,
        }}
      >
        <AppBar position="static" className="app-bar">
          <Toolbar className="toolbar">
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              className="menu-button"
            >
              <Menu />
            </IconButton>

            <Typography variant="h6" className="logo">
              Posturo Science
            </Typography>

            <Box className="nav-links">
              <Link to="/patient-list" className="nav-link">
                <Button color="inherit">Pacientes</Button>
              </Link>
            </Box>

            <Box className="search-box">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Buscar pacientes..."
                className="search-input"
              />
            </Box>

            <Box className="app-bar-actions">
              <IconButton color="inherit" aria-label="notificações">
                <Badge badgeContent={2} color="secondary">
                  <Notifications />
                </Badge>
              </IconButton>

              <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Olá, {userName}
                </Typography>
                <IconButton
                  color="inherit"
                  aria-label="perfil"
                  onClick={handleLogout}
                  title="Sair"
                >
                  <Person />
                </IconButton>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
      </motion.div>

      <motion.div
        ref={heroRef}
        className="hero-section"
        style={{
          scale: heroScale,
          opacity: heroOpacity,
        }}
      >
        <Container maxWidth={false} className="hero-container">
          <Box className="hero-content">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography variant="h2" component="h1" className="hero-title">
                Transforme sua prática clínica
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Typography variant="h5" className="hero-subtitle">
                Plataforma completa para avaliação postural e produção de
                palmilhas ortopédicas
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="contained" size="large" className="hero-button">
                Iniciar avaliação
              </Button>
            </motion.div>
          </Box>
        </Container>
      </motion.div>

      <Container maxWidth={false} className="main-content">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <Typography variant="h4" component="h2" className="section-title">
            Nosso fluxo de trabalho
          </Typography>

          <div className="workflow-cards">
            {processSteps.map((step) => (
              <motion.div
                key={step.id}
                className="workflow-card-wrapper"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card className="workflow-card">
                  <div
                    className="workflow-image"
                    style={{
                      backgroundImage: `url(${step.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      height: "180px",
                    }}
                  />
                  <CardContent className="workflow-content">
                    <Typography variant="h6" component="h3">
                      {step.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
          className="services-section"
        >
          <Typography variant="h4" component="h2" className="section-title">
            Serviços integrados
          </Typography>

          {/* Editor de Palmilha Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.3 }}
            className="insole-editor-section"
          >
            <Typography variant="h4" component="h2" className="section-title">
              Editor de Palmilhas
            </Typography>

            <div className="foot-selection-cards">
              <motion.div
                className="foot-card-wrapper"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateToInsoleEditor("left")}
              >
                <Card className="foot-card">
                  <CardContent className="foot-content">
                    <Typography variant="h6" component="h3">
                      Pé Esquerdo
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Editar ou criar uma palmilha para o pé esquerdo
                    </Typography>
                    <Button variant="contained" color="primary">
                      Iniciar Edição
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                className="foot-card-wrapper"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateToInsoleEditor("right")}
              >
                <Card className="foot-card">
                  <CardContent className="foot-content">
                    <Typography variant="h6" component="h3">
                      Pé Direito
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Editar ou criar uma palmilha para o pé direito
                    </Typography>
                    <Button variant="contained" color="primary">
                      Iniciar Edição
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          <div className="service-cards">
            {featuredServices.map((service, index) => (
              <motion.div
                key={service.id}
                className="service-card-wrapper"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card className="service-card">
                  <div className="service-icon-container">{service.icon}</div>
                  <CardContent className="service-content">
                    <Typography
                      variant="h6"
                      component="h3"
                      className="service-name"
                    >
                      {service.name}
                    </Typography>
                    <Typography variant="body2" className="service-description">
                      {service.description}
                    </Typography>
                    <Button variant="outlined" className="service-button">
                      Saiba mais
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
          className="platform-section"
        >
          <div className="platform-container">
            <div className="platform-image-wrapper">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="platform-image-container"
              >
                <img
                  src="https://source.unsplash.com/random/600x400/?medical-technology"
                  alt="Plataforma"
                  className="platform-image"
                />
              </motion.div>
            </div>
            <div className="platform-content-wrapper">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true, amount: 0.3 }}
                className="platform-content"
              >
                <Typography
                  variant="h3"
                  component="h2"
                  className="platform-title"
                >
                  Tecnologia avançada
                </Typography>
                <Typography variant="h5" className="platform-subtitle">
                  Integração completa do processo clínico e produtivo
                </Typography>
                <Typography variant="body1" className="platform-description">
                  Nossa plataforma unifica o fluxo de atendimento clínico e o
                  fluxo de produção, simplificando sua rotina profissional e
                  garantindo um registro detalhado do caso do paciente, do
                  design das palmilhas e do andamento dos pedidos até a entrega.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  className="platform-button"
                >
                  Solicitar demonstração
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Container>

      <footer className="footer">
        <Container maxWidth={false}>
          <div className="footer-container">
            <div className="footer-column">
              <Typography variant="h6" className="footer-title">
                Posturo Science
              </Typography>
              <Typography variant="body2" className="footer-description">
                Plataforma completa para avaliação postural e produção de
                palmilhas ortopédicas para profissionais de saúde.
              </Typography>
            </div>
            <div className="footer-column">
              <Typography variant="h6" className="footer-title">
                Links úteis
              </Typography>
              <ul className="footer-links">
                <li>
                  <a href="#">Sobre nós</a>
                </li>
                <li>
                  <a href="#">Política de privacidade</a>
                </li>
                <li>
                  <a href="#">Termos de uso</a>
                </li>
                <li>
                  <a href="#">Suporte técnico</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <Typography variant="h6" className="footer-title">
                Contato
              </Typography>
              <Typography variant="body2" className="footer-contact">
                Email: contato@posturoscience.com.br
                <br />
                Telefone: (11) 1234-5678
                <br />
                Endereço: Av. Paulista, 1000 - São Paulo/SP
              </Typography>
            </div>
          </div>
          <Box className="footer-bottom">
            <Typography variant="body2" className="copyright">
              © {new Date().getFullYear()} Posturo Science. Todos os direitos
              reservados.
            </Typography>
          </Box>
        </Container>
      </footer>
    </div>
  );
};

export default Home;
