import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import "./App.css";
import AppLayout from "./components/layout/AppLayout";
import { InsoleEditorProvider } from "./contexts/InsoleEditorContext";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

// Componente de Loading para Suspense
const LoadingFallback: React.FC = () => (
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
      Carregando...
    </Box>
  </Box>
);

// Lazy loading de todas as páginas para code splitting
const Landing = lazy(() => import("./pages/Landing"));
const Home = lazy(() => import("./pages/Home"));
const InsoleEditor = lazy(() => import("./pages/InsoleEditor"));
const InsoleViewer = lazy(() => import("./pages/InsoleViewer"));
const Login = lazy(() => import("./pages/Login"));
const PatientList = lazy(() => import("./pages/PatientList"));
const PatientRegister = lazy(() => import("./pages/PatientRegister"));
const Register = lazy(() => import("./pages/Register"));
const Consulta = lazy(() => import("./pages/Consulta"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const PatientHistory = lazy(() => import("./pages/PatientHistory"));
const PodalParts = lazy(() => import("./pages/PodalParts"));
const Users = lazy(() => import("./pages/Users"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const MobileUpload = lazy(() => import("./pages/MobileUpload"));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InsoleEditorProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Landing Page - sem layout */}
              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Landing />} />
              
              {/* Rotas de autenticação - sem o layout comum */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/mobile-upload" element={<MobileUpload />} />

              {/* Rotas protegidas - requerem autenticação */}
              <Route
                path="/home"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Home />
                    </AppLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient-list"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <PatientList />
                    </AppLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient-register"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <PatientRegister />
                    </AppLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient-edit/:id"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <PatientRegister />
                    </AppLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient-history/:id"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <PatientHistory />
                    </AppLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/consulta/:id"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Consulta />
                    </AppLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/insole-editor/:footSide/:patientId"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <InsoleEditor />
                    </AppLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/insole-viewer/:patientId/:footSide"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <InsoleViewer />
                    </AppLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/podal-parts"
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <PodalParts />
                    </AppLayout>
                  </PrivateRoute>
                }
              />
              {/* Rota protegida - requer role admin */}
              <Route
                path="/users"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AppLayout>
                      <Users />
                    </AppLayout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </Suspense>
        </InsoleEditorProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
