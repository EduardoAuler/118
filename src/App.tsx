import "./App.css";
import AppLayout from "./components/layout/AppLayout";
import { InsoleEditorProvider } from "./contexts/InsoleEditorContext";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import InsoleEditor from "./pages/InsoleEditor";
import InsoleViewer from "./pages/InsoleViewer";
import Login from "./pages/Login";
import PatientList from "./pages/PatientList";
import PatientRegister from "./pages/PatientRegister";
import Register from "./pages/Register";
import Consulta from "./pages/Consulta";
import ForgotPassword from "./pages/ForgotPassword";
import PatientHistory from "./pages/PatientHistory";
import PodalParts from "./pages/PodalParts";
import Users from "./pages/Users";
import Checkout from "./pages/Checkout";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InsoleEditorProvider>
          <Routes>
        {/* Landing Page - sem layout */}
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        
        {/* Rotas de autenticação - sem o layout comum */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Rotas principais - com o layout comum */}
        <Route
          path="/home"
          element={
            <AppLayout>
              <Home />
            </AppLayout>
          }
        />
        <Route
          path="/patient-list"
          element={
            <AppLayout>
              <PatientList />
            </AppLayout>
          }
        />
        <Route
          path="/patient-register"
          element={
            <AppLayout>
              <PatientRegister />
            </AppLayout>
          }
        />
        <Route
          path="/patient-edit/:id"
          element={
            <AppLayout>
              <PatientRegister />
            </AppLayout>
          }
        />
        <Route
          path="/patient-history/:id"
          element={
            <AppLayout>
              <PatientHistory />
            </AppLayout>
          }
        />
        <Route
          path="/consulta/:id"
          element={
            <AppLayout>
              <Consulta />
            </AppLayout>
          }
        />
        <Route
          path="/insole-editor/:footSide/:patientId"
          element={
            <AppLayout>
              <InsoleEditor />
            </AppLayout>
          }
        />
        <Route
          path="/insole-viewer/:patientId/:footSide"
          element={
            <AppLayout>
              <InsoleViewer />
            </AppLayout>
          }
        />
        <Route
          path="/podal-parts"
          element={
            <AppLayout>
              <PodalParts />
            </AppLayout>
          }
        />
        <Route
          path="/users"
          element={
            <AppLayout>
              <Users />
            </AppLayout>
          }
        />
      </Routes>
      </InsoleEditorProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
