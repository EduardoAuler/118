import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Container,
	Divider,
	Grid,
	IconButton,
	Paper,
	Typography,
	Accordion,
	AccordionSummary,
	AccordionDetails,
} from "@mui/material";

import {
	ArrowBack,
	ExpandMore,
	Person,
	CalendarToday,
	AccessTime,
	MedicalServices,
	Assignment,
	Healing,
	Visibility,
} from "@mui/icons-material";
import { 
	collection, 
	query, 
	where, 
	getDocs, 
	doc, 
	getDoc 
} from "firebase/firestore";
import { db } from "../services/firebaseconfig";
import { useAuth } from "../contexts/AuthContext";
import { createTenantService } from "../services/tenantService";
import "../styles/PatientHistory.scss";

// Interfaces
interface Patient {
	id: string;
	name: string;
	gender: "M" | "F";
	age: number;
	birthDate: string;
	phone: string;
	shoeSize: number;
}

interface Consultation {
	id: string;
	pacienteId: string;
	pacienteNome: string;
	observacoes?: string;
	diagnostico?: string;
	tratamento?: string;
	createdAt: any; // Timestamp do Firestore
	updatedAt: any; // Timestamp do Firestore
	planFrontal?: boolean;
	planPosterior?: boolean;
	planSagital?: boolean;
	photoUrl?: string;
	footSize?: string;
	insoleType?: string;
	leftArchType?: string;
	rightArchType?: string;
	hasLeftInsole?: boolean;
	hasRightInsole?: boolean;
	productionStatus?: string;
	scapula?: string;
	pelve?: string;
}

const PatientHistory: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { tenantId } = useAuth();
	const [patient, setPatient] = useState<Patient | null>(null);
	const [consultations, setConsultations] = useState<Consultation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [expandedConsultation, setExpandedConsultation] = useState<string | false>(false);

	useEffect(() => {
		if (id) {
			fetchPatientData();
			fetchConsultationHistory();
		} else {
			navigate("/patient-list");
		}
	}, [id, navigate]);

	const fetchPatientData = async () => {
		try {
			if (!id) return;
			
			if (!tenantId) {
				setError("Tenant ID não encontrado. Faça login novamente.");
				return;
			}

			console.log("Buscando dados do paciente:", id);
			const tenantService = createTenantService(tenantId);
			const patientData = await tenantService.getPatient(id);
			console.log("Dados do paciente:", patientData);
			
			if (patientData) {
				// Calcular idade se tiver data de nascimento
				let age = 0;
				if (patientData.birthDate) {
					const birthDate = patientData.birthDate?.toDate
						? patientData.birthDate.toDate()
						: new Date(patientData.birthDate);
					age = calculateAge(birthDate);
				}

				const patientInfo = {
					id: patientData.id,
					name: patientData.name || "Sem nome",
					gender: patientData.gender || "M",
					age: age,
					birthDate: patientData.birthDate
						? new Date(patientData.birthDate).toLocaleDateString("pt-BR")
						: "",
					phone: patientData.phone || "",
					shoeSize: patientData.shoeSize || 0,
				};
				
				console.log("Dados do paciente processados:", patientInfo);
				setPatient(patientInfo);
			} else {
				console.log("Paciente não encontrado");
				setError("Paciente não encontrado");
			}
		} catch (err) {
			console.error("Erro ao buscar dados do paciente:", err);
			setError("Erro ao carregar dados do paciente");
		}
	};

	const fetchConsultationHistory = async () => {
		try {
			if (!id) return;

			const consultationsQuery = query(
				collection(db, "consultas"),
				where("pacienteId", "==", id)
			);

			const consultationsSnapshot = await getDocs(consultationsQuery);
			const consultationsList = consultationsSnapshot.docs
				.map((doc) => {
					const data = doc.data() as Consultation;
					return {
						...data,
						id: doc.id
					};
				})
				.sort((a, b) => {
					// Ordenar por data de criação, mais recente primeiro
					const dateA = a.createdAt?.toDate 
						? a.createdAt.toDate() 
						: a.createdAt 
						? new Date(a.createdAt) 
						: new Date(0);
					
					const dateB = b.createdAt?.toDate 
						? b.createdAt.toDate() 
						: b.createdAt 
						? new Date(b.createdAt) 
						: new Date(0);
					
					return dateB.getTime() - dateA.getTime();
				});

			setConsultations(consultationsList);
		} catch (error) {
			console.error("Erro ao buscar histórico de consultas:", error);
			setError("Erro ao carregar histórico de consultas");
		} finally {
			setLoading(false);
		}
	};

	const calculateAge = (birthDate: Date): number => {
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			age--;
		}

		return age;
	};

	const formatDate = (timestamp: any) => {
		if (!timestamp) return "Data não disponível";
		
		const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
		return date.toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const formatTime = (timestamp: any) => {
		if (!timestamp) return "Hora não disponível";
		
		const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
		return date.toLocaleTimeString("pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleAccordionChange = (consultationId: string) => (
		event: React.SyntheticEvent,
		isExpanded: boolean
	) => {
		setExpandedConsultation(isExpanded ? consultationId : false);
	};

	const handleNewConsultation = () => {
		navigate(`/consulta/${id}`);
	};

	const getStatusChipColor = (status?: string) => {
		switch (status) {
			case "Pendente":
				return "warning";
			case "Em produção":
				return "info";
			case "Entregue":
				return "success";
			default:
				return "default";
		}
	};

	if (loading) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
					<CircularProgress />
					<Typography variant="h6" sx={{ ml: 2 }}>
						Carregando histórico do paciente...
					</Typography>
				</Box>
			</Container>
		);
	}

	if (error || !patient) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Alert severity="error" sx={{ mb: 2 }}>
					{error || "Paciente não encontrado"}
				</Alert>
				<Button
					startIcon={<ArrowBack />}
					onClick={() => navigate("/patient-list")}
					variant="outlined"
				>
					Voltar para Lista
				</Button>
			</Container>
		);
	}

	return (
		<div className="patient-history-page">
			<Container maxWidth="lg" sx={{ py: 4 }}>
				{/* Header com informações do paciente */}
				<Paper elevation={2} sx={{ p: 3, mb: 3 }}>
					<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
						<Button
							startIcon={<ArrowBack />}
							onClick={() => navigate("/patient-list")}
							variant="outlined"
							size="small"
						>
							Voltar
						</Button>
						<Button
							startIcon={<MedicalServices />}
							onClick={handleNewConsultation}
							variant="contained"
							color="primary"
						>
							Nova Consulta
						</Button>
					</Box>

					<Box display="flex" alignItems="center" gap={2}>
						<Person fontSize="large" color="primary" />
						<Box>
							<Typography variant="h4" component="h1" fontWeight="bold">
								{patient.name}
							</Typography>
							<Typography variant="h6" color="text.secondary">
								{patient.gender === "M" ? "Masculino" : "Feminina"} • {patient.age} anos
							</Typography>
							<Typography variant="body1" color="text.secondary">
								Nascimento: {patient.birthDate} • Telefone: {patient.phone}
							</Typography>
							<Typography variant="body1" color="text.secondary">
								Tamanho do calçado: {patient.shoeSize}
							</Typography>
						</Box>
					</Box>
				</Paper>

				{/* Histórico de consultas */}
				<Paper elevation={2} sx={{ p: 3 }}>
					<Typography variant="h5" component="h2" fontWeight="bold" mb={3}>
						Histórico de Consultas ({consultations.length})
					</Typography>

					{consultations.length === 0 ? (
						<Box 
							display="flex" 
							flexDirection="column" 
							alignItems="center" 
							justifyContent="center" 
							textAlign="center" 
							py={6} 
							sx={{ 
								bgcolor: 'background.default', 
								borderRadius: 2, 
								border: '2px dashed', 
								borderColor: 'divider' 
							}}
						>
							<MedicalServices 
								sx={{ 
									fontSize: 80, 
									color: "text.secondary", 
									mb: 2,
									opacity: 0.5
								}} 
							/>
							<Typography variant="h5" color="text.secondary" mb={2}>
								Nenhuma consulta anterior encontrada
							</Typography>
							<Typography variant="body1" color="text.secondary" mb={4}>
								Este paciente ainda não possui consultas registradas no sistema.
								<br />
								Clique no botão "Nova Consulta" para iniciar o primeiro atendimento.
							</Typography>
							<Button
								variant="contained"
								color="primary"
								size="large"
								startIcon={<MedicalServices />}
								onClick={handleNewConsultation}
							>
								Criar Primeira Consulta
							</Button>
						</Box>
					) : (
						<Box>
							{consultations.map((consultation, index) => (
								<Accordion
									key={consultation.id}
									expanded={expandedConsultation === consultation.id}
									onChange={handleAccordionChange(consultation.id)}
									sx={{ mb: 2 }}
								>
									<AccordionSummary expandIcon={<ExpandMore />}>
										<Box display="flex" alignItems="center" gap={2} width="100%">
											<Chip
												label={`Consulta ${consultations.length - index}`}
												color="primary"
												size="small"
											/>
											<Box display="flex" alignItems="center" gap={1}>
												<CalendarToday fontSize="small" color="action" />
												<Typography variant="body2">
													{formatDate(consultation.createdAt)}
												</Typography>
											</Box>
											<Box display="flex" alignItems="center" gap={1}>
												<AccessTime fontSize="small" color="action" />
												<Typography variant="body2">
													{formatTime(consultation.createdAt)}
												</Typography>
											</Box>
											{consultation.productionStatus && (
												<Chip
													label={consultation.productionStatus}
													color={getStatusChipColor(consultation.productionStatus)}
													size="small"
												/>
											)}
										</Box>
									</AccordionSummary>
									<AccordionDetails>
										<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
											{/* Observações */}
											{consultation.observacoes && (
												<Card variant="outlined">
													<CardContent>
														<Box display="flex" alignItems="center" gap={1} mb={1}>
															<Visibility color="primary" />
															<Typography variant="h6" fontWeight="bold">
																Observações
															</Typography>
														</Box>
														<Typography variant="body1">
															{consultation.observacoes}
														</Typography>
													</CardContent>
												</Card>
											)}

											{/* Diagnóstico e Tratamento */}
											<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
												{consultation.diagnostico && (
													<Card variant="outlined" sx={{ flex: 1, minWidth: 300 }}>
														<CardContent>
															<Box display="flex" alignItems="center" gap={1} mb={1}>
																<Assignment color="primary" />
																<Typography variant="h6" fontWeight="bold">
																	Diagnóstico
																</Typography>
															</Box>
															<Typography variant="body1">
																{consultation.diagnostico}
															</Typography>
														</CardContent>
													</Card>
												)}

												{consultation.tratamento && (
													<Card variant="outlined" sx={{ flex: 1, minWidth: 300 }}>
														<CardContent>
															<Box display="flex" alignItems="center" gap={1} mb={1}>
																<Healing color="primary" />
																<Typography variant="h6" fontWeight="bold">
																	Tratamento
																</Typography>
															</Box>
															<Typography variant="body1">
																{consultation.tratamento}
															</Typography>
														</CardContent>
													</Card>
												)}
											</Box>

											{/* Avaliação Postural */}
											<Card variant="outlined">
												<CardContent>
													<Typography variant="h6" fontWeight="bold" mb={2}>
														Avaliação Postural
													</Typography>
													<Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
														<Box>
															<Typography variant="body2" color="text.secondary">
																Plano Frontal
															</Typography>
															<Chip
																label={consultation.planFrontal ? "Sim" : "Não"}
																color={consultation.planFrontal ? "success" : "default"}
																size="small"
															/>
														</Box>
														<Box>
															<Typography variant="body2" color="text.secondary">
																Plano Posterior
															</Typography>
															<Chip
																label={consultation.planPosterior ? "Sim" : "Não"}
																color={consultation.planPosterior ? "success" : "default"}
																size="small"
															/>
														</Box>
														<Box>
															<Typography variant="body2" color="text.secondary">
																Plano Sagital
															</Typography>
															<Chip
																label={consultation.planSagital ? "Sim" : "Não"}
																color={consultation.planSagital ? "success" : "default"}
																size="small"
															/>
														</Box>
													</Box>
												</CardContent>
											</Card>

											{/* Informações do Arco Plantar */}
											{(consultation.leftArchType || consultation.rightArchType || consultation.footSize) && (
												<Card variant="outlined">
													<CardContent>
														<Typography variant="h6" fontWeight="bold" mb={2}>
															Avaliação do Arco Plantar
														</Typography>
														<Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
															{consultation.footSize && (
																<Box>
																	<Typography variant="body2" color="text.secondary">
																		Tamanho do Pé
																	</Typography>
																	<Typography variant="body1">
																		{consultation.footSize}
																	</Typography>
																</Box>
															)}
															{consultation.leftArchType && (
																<Box>
																	<Typography variant="body2" color="text.secondary">
																		Arco Esquerdo
																	</Typography>
																	<Typography variant="body1">
																		{consultation.leftArchType}
																	</Typography>
																</Box>
															)}
															{consultation.rightArchType && (
																<Box>
																	<Typography variant="body2" color="text.secondary">
																		Arco Direito
																	</Typography>
																	<Typography variant="body1">
																		{consultation.rightArchType}
																	</Typography>
																</Box>
															)}
														</Box>
													</CardContent>
												</Card>
											)}

											{/* Palmilhas */}
											{(consultation.hasLeftInsole || consultation.hasRightInsole) && (
												<Card variant="outlined">
													<CardContent>
														<Typography variant="h6" fontWeight="bold" mb={2}>
															Prescrição de palmilhas
														</Typography>
														<Box sx={{ display: "flex", gap: 3 }}>
															<Box>
																<Typography variant="body2" color="text.secondary">
																	Palmilha Esquerda
																</Typography>
																<Chip
																	label={consultation.hasLeftInsole ? "Sim" : "Não"}
																	color={consultation.hasLeftInsole ? "success" : "default"}
																	size="small"
																/>
															</Box>
															<Box>
																<Typography variant="body2" color="text.secondary">
																	Palmilha Direita
																</Typography>
																<Chip
																	label={consultation.hasRightInsole ? "Sim" : "Não"}
																	color={consultation.hasRightInsole ? "success" : "default"}
																	size="small"
																/>
															</Box>
														</Box>
													</CardContent>
												</Card>
											)}

											{/* Avaliação Transversa */}
											{(consultation.scapula || consultation.pelve) && (
												<Card variant="outlined">
													<CardContent>
														<Typography variant="h6" fontWeight="bold" mb={2}>
															Plano Transverso
														</Typography>
														<Box sx={{ display: "flex", gap: 3 }}>
															{consultation.scapula && (
																<Box>
																	<Typography variant="body2" color="text.secondary">
																		Escápula
																	</Typography>
																	<Typography variant="body1">
																		{consultation.scapula}
																	</Typography>
																</Box>
															)}
															{consultation.pelve && (
																<Box>
																	<Typography variant="body2" color="text.secondary">
																		Pelve
																	</Typography>
																	<Typography variant="body1">
																		{consultation.pelve}
																	</Typography>
																</Box>
															)}
														</Box>
													</CardContent>
												</Card>
											)}
										</Box>
									</AccordionDetails>
								</Accordion>
							))}
						</Box>
					)}
				</Paper>
			</Container>
		</div>
	);
};

export default PatientHistory;