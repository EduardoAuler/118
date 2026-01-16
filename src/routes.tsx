import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import InsoleEditor from "./pages/InsoleEditor";
import InsoleViewer from "./pages/InsoleViewer";
import Login from "./pages/Login";
import PatientList from "./pages/PatientList";
import PatientRegister from "./pages/PatientRegister";
import Register from "./pages/Register";
import Consulta from "./pages/Consulta";
import ForgotPassword from "./pages/ForgotPassword";
import MobileUpload from "./pages/MobileUpload";
import PatientHistory from "./pages/PatientHistory";
import PodalParts from "./pages/PodalParts";
import Users from "./pages/Users";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";

const AppRoutes: React.FC = () => {
	// Estado para verificar se o usuário está autenticado
	// Futuramente será substituído pela lógica do Firebase
	const isAuthenticated = true; // Alterado para true para facilitar o desenvolvimento

	return (
		<BrowserRouter>
			<Routes>
				{/* Rota principal - Landing Page */}
				<Route path="/" element={<Landing />} />
				<Route path="/landing" element={<Landing />} />
				
			{/* Rotas públicas */}
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route path="/forgot-password" element={<ForgotPassword />} />
			<Route path="/mobile-upload" element={<MobileUpload />} />
			<Route path="/checkout" element={<Checkout />} />
			<Route path="/checkout/success" element={<CheckoutSuccess />} />

				{/* Rotas protegidas */}
				<Route path="/home" element={<Home />} />
				<Route path="/patient-list" element={<PatientList />} />
				<Route path="/patient-register" element={<PatientRegister />} />
				<Route path="/patient-edit/:id" element={<PatientRegister />} />
				<Route path="/patient-history/:id" element={<PatientHistory />} />
				<Route path="/consulta/:id" element={<Consulta />} />
				<Route path="/insole-editor/:footId/:id" element={<InsoleEditor />} />
				<Route path="/insole-viewer/:patientId/:footSide" element={<InsoleViewer />} />
				<Route path="/podal-parts" element={<PodalParts />} />
				<Route path="/users" element={<Users />} />

				{/* Rota de fallback */}
				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
		</BrowserRouter>
	);
};

export default AppRoutes;
