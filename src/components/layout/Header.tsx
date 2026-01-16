import {
  Close,
  KeyboardArrowRight,
  Menu as MenuIcon,
  People,
  Person,
  Logout,
  Category,
  AdminPanelSettings,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Zoom,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebaseconfig";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/Podostore/Logo/Branco/Assinatura Visual_Tudo Sobre Palmilhas (branco).png";
import "../../styles/Header.scss";


const Header: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [animateTitle, setAnimateTitle] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // Menus baseados no tipo de usuário
  const getMenuItems = () => {
    const baseItems = [
      { text: "Lista de Pacientes", icon: <People />, path: "/patient-list" },
      { text: "Cadastrar Paciente", icon: <Person />, path: "/patient-register" },
      { text: "Peças Podais", icon: <Category />, path: "/podal-parts" },
    ];

    if (isAdmin) {
      baseItems.push({
        text: "Usuários",
        icon: <AdminPanelSettings />,
        path: "/users"
      });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  // Detectar scroll para mudar a aparência do header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Animar o título da página quando ele muda
  useEffect(() => {
    setAnimateTitle(false);
    const timeout = setTimeout(() => setAnimateTitle(true), 100);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // Verifica se o item do menu está ativo
  const isActive = (path: string) => {
    return (
      location.pathname === path ||
      (path === "/patient-register" &&
        location.pathname.includes("/patient-edit"))
    );
  };

  // Define o título da página baseado no caminho atual
  const getPageTitle = (): string => {
    const path = location.pathname;

    if (path === "/patient-list") return "Lista de Pacientes";
    if (path === "/patient-register") return "Cadastro de Paciente";
    if (path === "/podal-parts") return "Peças Podais";
    if (path === "/users") return "Gerenciar Usuários";
    if (path.includes("/patient-edit")) return "Edição de Paciente";
    if (path.includes("/insole-editor")) {
      const footSide = path.includes("/left") ? "Esquerdo" : "Direito";
      return `Editor de Palmilha - Pé ${footSide}`;
    }

    return "";
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async () => {
    try {
      // Fazer signOut do Firebase
      await signOut(auth);
      
      // Limpar dados de autenticação
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('tenantId');
      sessionStorage.clear();
      
      // Redirecionar para a landing page (tela inicial)
      navigate('/');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Mesmo com erro, redireciona para a landing page
      navigate('/');
    }
  };

  return (
    <div className={`header-container ${scrolled ? "scrolled" : ""}`}>
      <AppBar
        position="fixed"
        className={`app-header ${scrolled ? "scrolled" : ""}`}
        elevation={scrolled ? 4 : 0}
      >
        <Toolbar className="toolbar">
          <Box className="logo-section">
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer}
                className="menu-button"
                edge="start"
              >
                <MenuIcon />
              </IconButton>
            )}

            <Box className="logo-container" onClick={() => navigate("/")}>
              <img
                src={logo}
                alt="Logo Tudo Sobre Palmilhas"
                className="app-logo-header"
                style={{
                  filter: 'brightness(0) saturate(100%)',
                  maxHeight: '100px',
                  width: 'auto'
                }}
              />
            </Box>
          </Box>

          {!isMobile && (
            <Box className="desktop-menu">
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  className={`nav-button ${
                    isActive(item.path) ? "active" : ""
                  }`}
                  startIcon={item.icon}
                >
                  <span className="button-text">{item.text}</span>
                  {isActive(item.path) && <div className="active-indicator" />}
                </Button>
              ))}
            </Box>
          )}

          {/* Botão de Logout */}
          <Box className="logout-section">
            <Button
              onClick={handleLogout}
              className="logout-button"
              startIcon={<Logout />}
              variant="outlined"
              color="inherit"
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <span className="button-text">Sair</span>
            </Button>
          </Box>
        </Toolbar>

        {/* Barra de contexto com animação */}
        <Box className="context-bar">
          <Fade in={animateTitle} timeout={800}>
            <Typography variant="h6" className="page-title">
              {getPageTitle()}
            </Typography>
          </Fade>
          <Box className="breadcrumb">
            <Typography
              variant="body2"
              component={Link}
              to="/"
              className="breadcrumb-home"
            >
              Início
            </Typography>
            <KeyboardArrowRight
              fontSize="small"
              className="breadcrumb-separator"
            />
            <Typography variant="body2" className="breadcrumb-current">
              {getPageTitle()}
            </Typography>
          </Box>
        </Box>
      </AppBar>


      {/* Drawer para menu móvel com animações aprimoradas */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        className="nav-drawer"
        SlideProps={{
          timeout: 400,
        }}
      >
        <Box className="drawer-header">
          <Box className="drawer-logo-container">
            <img 
              src={logo} 
              alt="Logo Tudo Sobre Palmilhas" 
              className="drawer-logo"
              style={{
                filter: 'brightness(0) saturate(100%)',
                maxHeight: '80px',
                width: 'auto'
              }}
            />
          </Box>
          <IconButton onClick={toggleDrawer} className="drawer-close">
            <Close />
          </IconButton>
        </Box>

        <List className="drawer-list">
          {menuItems.map((item, index) => (
            <Zoom
              in={drawerOpen}
              style={{
                transitionDelay: drawerOpen ? `${index * 100}ms` : "0ms",
              }}
              key={item.text}
            >
              <ListItem
                component={Link}
                to={item.path}
                className={`drawer-item ${
                  isActive(item.path) ? "active-item" : ""
                }`}
                onClick={toggleDrawer}
              >
                <ListItemIcon className="drawer-icon">{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  className="drawer-text"
                  primaryTypographyProps={{
                    className: isActive(item.path) ? "active-text" : "",
                  }}
                />
                {isActive(item.path) && (
                  <div className="active-indicator-mobile" />
                )}
              </ListItem>
            </Zoom>
          ))}
          
          {/* Separador */}
          <Box sx={{ height: 1, bgcolor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />
          
          {/* Botão de Logout no Drawer */}
          <Zoom
            in={drawerOpen}
            style={{
              transitionDelay: drawerOpen ? `${menuItems.length * 100 + 200}ms` : "0ms",
            }}
          >
            <ListItem
              onClick={() => {
                handleLogout();
                toggleDrawer();
              }}
              className="drawer-item logout-item"
              sx={{
                color: '#ff6b6b',
                '&:hover': {
                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                }
              }}
            >
              <ListItemIcon className="drawer-icon" sx={{ color: 'inherit' }}>
                <Logout />
              </ListItemIcon>
              <ListItemText
                primary="Sair"
                className="drawer-text"
                primaryTypographyProps={{
                  sx: { color: 'inherit', fontWeight: 500 }
                }}
              />
            </ListItem>
          </Zoom>
        </List>
      </Drawer>
    </div>
  );
};

export default Header;
