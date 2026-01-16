import { ArrowBack, ArrowForward } from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Container,
	Paper,
	Snackbar,
	Step,
	StepLabel,
	Stepper,
	Typography,
	TextField,
} from "@mui/material";
import { doc, getDoc, updateDoc, Timestamp, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FootArch from "../components/patient/FootArch";
import Gait from "../components/patient/Gait";
import OculomotorSystem from "../components/patient/OculomotorSystem";
import PosturalTests from "../components/patient/PosturalTests";
import PostureEvaluation from "../components/patient/PostureEvaluation";
import StomatognaticSystem from "../components/patient/StomatognaticSystem";
import { db } from "../services/firebaseconfig";
import { useAuth } from "../contexts/AuthContext";
import { createTenantService } from "../services/tenantService";
import { saveConsultationIncrementally, finalizeConsultation, generateConsultationId, ConsultationData } from "../services/consultationService";
import "../styles/PatientRegister.scss";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { styled } from "@mui/material/styles";

const Consulta: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { tenantId } = useAuth();
	const [activeStep, setActiveStep] = useState(0);
	const [loading, setLoading] = useState(false);
	const [patientName, setPatientName] = useState("");
	const [consultationId, setConsultationId] = useState<string>("");
	const [alert, setAlert] = useState({
		open: false,
		message: "",
		severity: "success" as "success" | "error",
	});
	const [showVipOculo, setShowVipOculo] = useState(true);
	const [showVipStomato, setShowVipStomato] = useState(true);
	// Interface para o tipo de consulta
	interface Consultation {
		id: string;
		pacienteId: string;
		pacienteNome: string;
		observacoes?: string;
		diagnostico?: string;
		tratamento?: string;
		createdAt: any; // Timestamp do Firestore
		updatedAt: any; // Timestamp do Firestore
		[key: string]: any; // Para outros campos que possam existir
	}

	const [previousConsultations, setPreviousConsultations] = useState<Consultation[]>([]);

	// Estado do formulário da consulta
	const [consultaData, setConsultaData] = useState({
		// Avaliação posturológica
		planFrontal: false,
		planPosterior: false,
		planSagital: false,
		photoUrl: "",

		// Anotações da consulta
		observacoes: "",
		diagnostico: "",
		tratamento: "",

		// Avaliação postural - plano transverso
		scapula: "",
		pelve: "",

		// Arco plantar
		footSize: "",
		insoleType: "",
		footwearType: {
			sneakers: false,
			shoes: false,
		},
		insoleCharacteristics: {
			hiTechComfort: false,
			standard: false,
			flexiGel: false,
			podoTop: false,
			podoPlus: false,
			hiTechPosturology: false,
			sports: false,
			ecoSystem: false,
		},
		leftArchType: "",
		rightArchType: "",
		leftArchSimple: "",
		rightArchSimple: "",

		// Sistema oculomotor, estomatognático, marcha e testes
		// Serão adicionados conforme necessário

		// Valores padrão para listagem
		hasLeftInsole: false,
		hasRightInsole: false,
		productionStatus: "Pendente",

		// Testes posturológicos
		sltEsquerdo: {
			superior: false,
			medial: false,
			inferior: false,
		},
		sltDireito: {
			superior: false,
			medial: false,
			inferior: false,
		},
		indicadoresEsquerdo: {
			elevado: false,
			abduzido: false,
			aduzido: false,
			baixo: false,
		},
		indicadoresDireito: {
			elevado: false,
			abduzido: false,
			aduzido: false,
			baixo: false,
		},
	});

	// Buscar dados do paciente ao carregar
	useEffect(() => {
		if (id) {
			// Gerar ID único para a consulta
			const newConsultationId = generateConsultationId();
			setConsultationId(newConsultationId);
			
			fetchPatientData(id);
			fetchPreviousConsultations(id);
		} else {
			navigate("/patient-list");
		}
	}, [id, navigate]);

	// Buscar dados do paciente
	const fetchPatientData = async (patientId: string) => {
		setLoading(true);
		try {
			if (!tenantId) {
				setAlert({
					open: true,
					message: "Tenant ID não encontrado. Faça login novamente.",
					severity: "error",
				});
				navigate("/patient-list");
				return;
			}

			const tenantService = createTenantService(tenantId);
			const patientData = await tenantService.getPatient(patientId);
			
			if (patientData) {
				setPatientName(patientData.name || "Paciente");

				// Preencher o formulário com os dados existentes (se houver)
				setConsultaData({
					...consultaData,
					planFrontal: patientData.planFrontal || false,
					planPosterior: patientData.planPosterior || false,
					planSagital: patientData.planSagital || false,
					photoUrl:
						patientData.photoUrl ||
						"https://redthread.uoregon.edu/files/large/affd16fd5264cab9197da4cd1a996f820e601ee4.jpg",
					footSize: patientData.footSize || "",
					insoleType: patientData.insoleType || "",
					hasLeftInsole: patientData.hasLeftInsole || false,
					hasRightInsole: patientData.hasRightInsole || false,
					productionStatus: patientData.productionStatus || "Pendente",
					// Garantir que objetos aninhados existam
					footwearType: patientData.footwearType || consultaData.footwearType,
					insoleCharacteristics:
						patientData.insoleCharacteristics || consultaData.insoleCharacteristics,
					sltEsquerdo: patientData.sltEsquerdo || consultaData.sltEsquerdo,
					sltDireito: patientData.sltDireito || consultaData.sltDireito,
					indicadoresEsquerdo:
						patientData.indicadoresEsquerdo || consultaData.indicadoresEsquerdo,
					indicadoresDireito:
						patientData.indicadoresDireito || consultaData.indicadoresDireito,
				});
			} else {
				setAlert({
					open: true,
					message: "Paciente não encontrado!",
					severity: "error",
				});
				navigate("/patient-list");
			}
		} catch (error) {
			console.error("Erro ao buscar dados do paciente:", error);
			setAlert({
				open: true,
				message: "Erro ao carregar dados do paciente",
				severity: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	// Buscar consultas anteriores
	const fetchPreviousConsultations = async (patientId: string) => {
		try {
			const consultationsRef = collection(db, "consultas");
			const q = query(
				consultationsRef,
				where("pacienteId", "==", patientId)
			);
			
			const querySnapshot = await getDocs(q);
			const consultations: Consultation[] = querySnapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data(),
			} as Consultation));
			
			// Ordenar no cliente para evitar necessidade de índice composto
			consultations.sort((a, b) => {
				const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
				const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
				return dateB.getTime() - dateA.getTime(); // Ordem decrescente (mais recente primeiro)
			});
			
			setPreviousConsultations(consultations);
		} catch (error) {
			console.error("Erro ao buscar consultas anteriores:", error);
			// Se não conseguir buscar, deixa array vazio
			setPreviousConsultations([]);
		}
	};

	// Etapas da consulta
	const steps = [
		"Anotações",
		"Avaliação Posturológica", 
		"Arco Plantar",
		"Sistema Oculomotor",
		"Sistema Estomatognático",
		"Marcha",
		"Testes Posturológicos",
	];

	// Handler para atualizar o estado do formulário
	const handleInputChange = (field: string, value: any) => {
		const newData = {
			...consultaData,
			[field]: value,
		};
		
		setConsultaData(newData);
		
		// Salvar incrementalmente no Firestore
		if (consultationId && id) {
			saveConsultationIncrementally(consultationId, {
				pacienteId: id,
				pacienteNome: patientName,
				[field]: value,
			}, activeStep).catch(error => {
				console.error("Erro ao salvar incrementalmente:", error);
			});
		}
	};

	// Navegação entre etapas
	const handleNext = () => {
		setActiveStep((prevStep) => prevStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevStep) => prevStep - 1);
	};

	const handleCloseAlert = () => {
		setAlert({
			...alert,
			open: false,
		});
	};

	// Finalização da consulta
	const handleSubmit = async () => {
		setLoading(true);
		try {
			if (!id || !consultationId) {
				throw new Error("ID do paciente ou consulta não encontrado");
			}

			// Finalizar consulta (remove draft status)
			await finalizeConsultation(consultationId, {
				...consultaData,
				pacienteId: id,
				pacienteNome: patientName,
			});

			// Também atualizar o documento do paciente com os dados mais recentes
			const patientUpdateData = {
				...consultaData,
				updatedAt: Timestamp.now(),
				lastConsultationAt: Timestamp.now(),
			};

			await updateDoc(doc(db, "pacientes", id), patientUpdateData);

			setAlert({
				open: true,
				message: "Consulta registrada com sucesso!",
				severity: "success",
			});

			// Aguardar um pouco para mostrar a mensagem antes de redirecionar
			setTimeout(() => {
				navigate("/patient-list");
			}, 1500);
		} catch (error) {
			console.error("Erro ao salvar consulta:", error);
			setAlert({
				open: true,
				message: "Erro ao registrar consulta. Tente novamente.",
				severity: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	// Custom Step Icon for VIP steps
	const VipStepIcon = (props: any) => {
		const { active, completed, className } = props;
		return (
			<span className={className}>
				<svg width="24" height="24" viewBox="0 0 24 24">
					<circle
						cx="12"
						cy="12"
						r="12"
						fill={active || completed ? "#43a047" : "#bdbdbd"}
					/>
					<text
						x="12"
						y="16"
						textAnchor="middle"
						fontSize="13"
						fill="#fff"
						fontWeight="bold"
					>
						{props.icon}
					</text>
				</svg>
			</span>
		);
	};

	// Renderiza o componente atual com base na etapa ativa
	const renderStepContent = () => {
		switch (activeStep) {
			case 0:
				return (
					<Box sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
							<i className="fas fa-edit" style={{ marginRight: '8px' }}></i>
							Anotações da Consulta
						</Typography>
						
						{/* Anotações da consulta atual */}
						<Box sx={{ mb: 4 }}>
							<Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
								<i className="fas fa-plus-circle" style={{ marginRight: '8px', color: '#1976d2' }}></i>
								Nova Consulta
							</Typography>
							<TextField
								label="Observações"
								multiline
								rows={4}
								fullWidth
								margin="normal"
								variant="outlined"
								value={consultaData.observacoes || ""}
								onChange={(e) => handleInputChange("observacoes", e.target.value)}
								placeholder="Digite suas observações sobre a consulta atual..."
							/>
							<TextField
								label="Diagnóstico"
								multiline
								rows={4}
								fullWidth
								margin="normal"
								variant="outlined"
								value={consultaData.diagnostico || ""}
								onChange={(e) => handleInputChange("diagnostico", e.target.value)}
								placeholder="Digite o diagnóstico baseado na avaliação..."
							/>
							<TextField
								label="Plano de Tratamento"
								multiline
								rows={4}
								fullWidth
								margin="normal"
								variant="outlined"
								value={consultaData.tratamento || ""}
								onChange={(e) => handleInputChange("tratamento", e.target.value)}
								placeholder="Descreva o plano de tratamento recomendado..."
							/>
						</Box>

						{/* Consultas anteriores */}
						{previousConsultations.length > 0 && (
							<Box sx={{ mt: 4, p: 3, bgcolor: "#f8f9fa", borderRadius: 2, border: "1px solid #e9ecef" }}>
								<Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: "#495057" }}>
									<i className="fas fa-history" style={{ marginRight: '8px' }}></i>
									Histórico de Consultas Anteriores ({previousConsultations.length})
								</Typography>
								
								<Box sx={{ maxHeight: 400, overflowY: "auto" }}>
									{previousConsultations.map((consultation, index) => (
										<Paper 
											key={consultation.id} 
											sx={{ 
												p: 2, 
												mb: 2, 
												bgcolor: "#ffffff",
												border: "1px solid #dee2e6",
												borderRadius: 1
											}}
										>
											<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
												<Typography variant="subtitle2" fontWeight="bold" color="primary">
													<i className="fas fa-calendar-alt" style={{ marginRight: '6px' }}></i>
													Consulta #{previousConsultations.length - index}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{consultation.createdAt?.toDate ? 
														consultation.createdAt.toDate().toLocaleDateString("pt-BR", {
															day: "2-digit",
															month: "2-digit", 
															year: "numeric",
															hour: "2-digit",
															minute: "2-digit"
														}) : 
														"Data não disponível"
													}
												</Typography>
											</Box>
											
											{consultation.observacoes && (
												<Box sx={{ mb: 1 }}>
													<Typography variant="caption" fontWeight="bold" color="text.secondary">
														<i className="fas fa-eye" style={{ marginRight: '4px' }}></i>
														Observações:
													</Typography>
													<Typography variant="body2" sx={{ pl: 1, borderLeft: "3px solid #007bff", ml: 1 }}>
														{consultation.observacoes}
													</Typography>
												</Box>
											)}
											
											{consultation.diagnostico && (
												<Box sx={{ mb: 1 }}>
													<Typography variant="caption" fontWeight="bold" color="text.secondary">
														<i className="fas fa-stethoscope" style={{ marginRight: '4px' }}></i>
														Diagnóstico:
													</Typography>
													<Typography variant="body2" sx={{ pl: 1, borderLeft: "3px solid #28a745", ml: 1 }}>
														{consultation.diagnostico}
													</Typography>
												</Box>
											)}
											
											{consultation.tratamento && (
												<Box>
													<Typography variant="caption" fontWeight="bold" color="text.secondary">
														<i className="fas fa-pills" style={{ marginRight: '4px' }}></i>
														Tratamento:
													</Typography>
													<Typography variant="body2" sx={{ pl: 1, borderLeft: "3px solid #ffc107", ml: 1 }}>
														{consultation.tratamento}
													</Typography>
												</Box>
											)}
											
											{!consultation.observacoes && !consultation.diagnostico && !consultation.tratamento && (
												<Typography variant="body2" color="text.secondary" fontStyle="italic">
													Nenhuma anotação registrada nesta consulta.
												</Typography>
											)}
										</Paper>
									))}
								</Box>
							</Box>
						)}
						
						{previousConsultations.length === 0 && (
							<Box sx={{ mt: 4, p: 3, bgcolor: "#e3f2fd", borderRadius: 2, textAlign: "center" }}>
								<Typography variant="body2" color="text.secondary">
									<i className="fas fa-lightbulb" style={{ marginRight: '6px' }}></i>
									Esta é a primeira consulta deste paciente.
								</Typography>
							</Box>
						)}
					</Box>
				);
			case 1:
				return (
					<PostureEvaluation
						patientData={{
							frontalPhoto: consultaData.planFrontal
								? consultaData.photoUrl
								: undefined,
							posteriorPhoto: consultaData.planPosterior
								? consultaData.photoUrl
								: undefined,
							sagittalPhoto: consultaData.planSagital
								? consultaData.photoUrl
								: undefined,
							topPhoto: undefined,
							scapula: consultaData.scapula,
							pelve: consultaData.pelve,
							// Dados do arco plantar
							footSize: consultaData.footSize,
							footwearType: consultaData.footwearType,
							insoleCharacteristics: consultaData.insoleCharacteristics,
							leftArchType: consultaData.leftArchType,
							rightArchType: consultaData.rightArchType,
							leftArchSimple: consultaData.leftArchSimple,
							rightArchSimple: consultaData.rightArchSimple,
						}}
						onChange={handleInputChange}
						consultationId={consultationId}
						patientId={id}
					/>
				);
			case 2:
				return (
					<FootArch patientData={consultaData} onChange={handleInputChange} />
				);
			case 3:
				return (
					<>
						{showVipOculo ? (
							<Alert
								icon={false}
								sx={{
									mb: 3,
									bgcolor: "#e3f2fd",
									color: "#1565c0",
									border: "2px solid #1976d2",
									fontWeight: "bold",
									fontSize: 20,
									textAlign: "center",
									boxShadow: 2,
									borderRadius: 2,
									py: 3,
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
								}}
							>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										mb: 1,
									}}
								>
									<span
										role="img"
										aria-label="vip"
										style={{ fontSize: 32, marginRight: 8 }}
									>
										💎
									</span>
									<span style={{ fontWeight: 700, fontSize: 24 }}>
										Funcionalidade VIP
									</span>
									<span
										role="img"
										aria-label="vip"
										style={{ fontSize: 32, marginLeft: 8 }}
									>
										💎
									</span>
								</Box>
								<Typography sx={{ fontWeight: 500, mb: 2 }}>
									O acesso a esta etapa é exclusivo para assinantes VIP.
									<br />
									Deseja continuar sem acesso ou saber mais?
								</Typography>
								<Box
									sx={{
										mt: 1,
										display: "flex",
										justifyContent: "center",
										gap: 2,
									}}
								>
									<Button
										variant="contained"
										color="primary"
										onClick={() => setShowVipOculo(false)}
										sx={{ fontWeight: "bold", minWidth: 180 }}
									>
										Continuar sem acesso
									</Button>
									<Button
										variant="outlined"
										color="primary"
										onClick={() =>
											window.open("https://wa.me/5511999999999", "_blank")
										}
										sx={{ fontWeight: "bold", minWidth: 180 }}
									>
										Quero ser VIP
									</Button>
								</Box>
							</Alert>
						) : (
							<OculomotorSystem
								patientData={consultaData}
								onChange={handleInputChange}
							/>
						)}
					</>
				);
			case 4:
				return (
					<>
						{showVipStomato ? (
							<Alert
								icon={false}
								sx={{
									mb: 3,
									bgcolor: "#e3f2fd",
									color: "#1565c0",
									border: "2px solid #1976d2",
									fontWeight: "bold",
									fontSize: 20,
									textAlign: "center",
									boxShadow: 2,
									borderRadius: 2,
									py: 3,
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
								}}
							>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										mb: 1,
									}}
								>
									<span
										role="img"
										aria-label="vip"
										style={{ fontSize: 32, marginRight: 8 }}
									>
										💎
									</span>
									<span style={{ fontWeight: 700, fontSize: 24 }}>
										Funcionalidade VIP
									</span>
									<span
										role="img"
										aria-label="vip"
										style={{ fontSize: 32, marginLeft: 8 }}
									>
										💎
									</span>
								</Box>
								<Typography sx={{ fontWeight: 500, mb: 2 }}>
									O acesso a esta etapa é exclusivo para assinantes VIP.
									<br />
									Deseja continuar sem acesso ou saber mais?
								</Typography>
								<Box
									sx={{
										mt: 1,
										display: "flex",
										justifyContent: "center",
										gap: 2,
									}}
								>
									<Button
										variant="contained"
										color="primary"
										onClick={() => setShowVipStomato(false)}
										sx={{ fontWeight: "bold", minWidth: 180 }}
									>
										Continuar sem acesso
									</Button>
									<Button
										variant="outlined"
										color="primary"
										onClick={() =>
											window.open("https://wa.me/5511999999999", "_blank")
										}
										sx={{ fontWeight: "bold", minWidth: 180 }}
									>
										Quero ser VIP
									</Button>
								</Box>
							</Alert>
						) : (
							<StomatognaticSystem
								patientData={consultaData}
								onChange={handleInputChange}
							/>
						)}
					</>
				);
			case 5:
				return <Gait patientData={consultaData} onChange={handleInputChange} />;
			case 6:
				return (
					<PosturalTests
						patientData={consultaData}
						onChange={handleInputChange}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="patient-register-page">
			<Snackbar
				open={alert.open}
				autoHideDuration={6000}
				onClose={handleCloseAlert}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Alert onClose={handleCloseAlert} severity={alert.severity}>
					{alert.message}
				</Alert>
			</Snackbar>

			<Container maxWidth={false} className="patient-register-container">
				<Paper
					elevation={3}
					className="patient-register-paper"
					sx={{
						minHeight: 500,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
					}}
				>
					<Box sx={{ mb: 2 }}>
						<Button
							variant="outlined"
							startIcon={<ArrowBack />}
							onClick={() => navigate("/patient-list")}
						>
							Voltar para Lista
						</Button>
						<Typography variant="h5" sx={{ mt: 2 }}>
							Consulta: {patientName}
						</Typography>
					</Box>

					<Stepper activeStep={activeStep} className="patient-register-stepper">
						{steps.map((label, idx) => (
							<Step key={label}>
								<StepLabel
									StepIconComponent={
										idx === 3 || idx === 4 ? VipStepIcon : undefined
									}
								>
									{label}
								</StepLabel>
							</Step>
						))}
					</Stepper>

					<Box className="patient-register-content">{renderStepContent()}</Box>

					<Box className="patient-register-buttons">
						{activeStep > 0 && (
							<Button
								onClick={handleBack}
								startIcon={<ArrowBack />}
								className="back-button"
								disabled={loading}
							>
								Voltar
							</Button>
						)}

						{activeStep < steps.length - 1 ? (
							<Button
								onClick={handleNext}
								endIcon={<ArrowForward />}
								variant="contained"
								className="next-button"
								disabled={loading}
							>
								Próximo
							</Button>
						) : (
							<Button
								onClick={handleSubmit}
								variant="contained"
								color="primary"
								className="submit-button"
								disabled={loading}
							>
								{loading ? "Salvando..." : "Finalizar Consulta"}
							</Button>
						)}
					</Box>
				</Paper>
			</Container>
		</div>
	);
};

export default Consulta;
