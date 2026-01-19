import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface PrivateRouteProps {
  children: React.ReactElement;
  requiredRole?: 'admin' | 'user';
}

/**
 * Componente para proteger rotas que requerem autenticação
 * Redireciona para /login se o usuário não estiver autenticado
 * Verifica permissões de role se necessário
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { user, userData, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Box sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Verificando autenticação...
        </Box>
      </Box>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!user || !userData) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se o usuário não estiver ativo, redirecionar
  if (!userData.isActive) {
    return <Navigate to="/login" state={{ from: location, reason: 'account_inactive' }} replace />;
  }

  // Se a rota requer role específica, verificar
  if (requiredRole === 'admin' && userData.role !== 'admin') {
    // Redirecionar para home se não tiver permissão
    return <Navigate to="/home" replace />;
  }

  // Usuário autenticado e com permissão, renderizar componente
  return children;
};

export default PrivateRoute;
