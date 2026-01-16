import {
	Add,
	Delete,
	Edit,
	KeyboardArrowDown,
	Refresh,
	Search,
	Visibility,
	MedicalServices,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Container,
	IconButton,
	InputAdornment,
	Menu,
	MenuItem,
	Paper,
	Snackbar,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../services/firebaseconfig";
import { useAuth } from "../contexts/AuthContext";
import { createTenantService } from "../services/tenantService";
import "../styles/PatientList.scss";

// Tipo para nossos dados de paciente
interface Patient {
	id: string;
	date: string;
	time: string;
	name: string;
	gender: "M" | "F";
	age: number;
	birthDate: string;
	phone: string;
	shoeSize: number;
	hasLeftInsole: boolean;
	hasRightInsole: boolean;
	planFrontal: boolean;
	planPosterior: boolean;
	planSagital: boolean;
	productionStatus: string;
	photoUrl?: string;
}

const PatientList: React.FC = () => {
	const navigate = useNavigate();
	const { tenantId } = useAuth();
	const [searchTerm, setSearchTerm] = useState("");
	const [patients, setPatients] = useState<Patient[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [anchorElE, setAnchorElE] = useState<null | HTMLElement>(null);
	const [anchorElD, setAnchorElD] = useState<null | HTMLElement>(null);
	const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
		null
	);
	const [alertOpen, setAlertOpen] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
		"success"
	);

	// Buscar pacientes do Firestore
	const fetchPatients = async () => {
		setLoading(true);
		setError(null);
		try {
			if (!tenantId) {
				setError("Tenant ID não encontrado. Faça login novamente.");
				return;
			}

			const tenantService = createTenantService(tenantId);
			const patientsData = await tenantService.getPatients();

			const patientsList = patientsData.map((data) => {
				// Formatar data e hora para exibição
				const createdAt = data.createdAt?.toDate
					? data.createdAt.toDate()
					: new Date(data.createdAt);
				const dateStr = createdAt.toLocaleDateString("pt-BR");
				const timeStr = createdAt.toLocaleTimeString("pt-BR", {
					hour: "2-digit",
					minute: "2-digit",
				});

				// Calcular idade se tiver data de nascimento
				let age = 0;
				if (data.birthDate) {
					const birthDate = data.birthDate?.toDate
						? data.birthDate.toDate()
						: new Date(data.birthDate);
					age = calculateAge(birthDate);
				}

				return {
					id: data.id,
					date: dateStr,
					time: timeStr,
					name: data.name || "Sem nome",
					gender: data.gender || "M",
					age: age,
					birthDate: data.birthDate
						? new Date(data.birthDate).toLocaleDateString("pt-BR")
						: "",
					phone: data.phone || "",
					shoeSize: data.shoeSize || 0,
					hasLeftInsole: data.hasLeftInsole || false,
					hasRightInsole: data.hasRightInsole || false,
					planFrontal: data.planFrontal || false,
					planPosterior: data.planPosterior || false,
					planSagital: data.planSagital || false,
					productionStatus: data.productionStatus || "Pendente",
					photoUrl:
						data.photoUrl ||
						"https://redthread.uoregon.edu/files/large/affd16fd5264cab9197da4cd1a996f820e601ee4.jpg",
				};
			});

			setPatients(patientsList);
		} catch (err) {
			console.error("Erro ao buscar pacientes:", err);
			setError("Falha ao carregar pacientes. Por favor, tente novamente.");
		} finally {
			setLoading(false);
		}
	};

	// Calcular idade a partir da data de nascimento
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

	// Buscar pacientes ao carregar o componente
	useEffect(() => {
		fetchPatients();
	}, []);

	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	const handleRefresh = () => {
		fetchPatients();
	};

	const handleAddNewPatient = () => {
		navigate("/patient-register");
	};

	const handleEditPatient = (id: string) => {
		navigate(`/patient-edit/${id}`);
	};

	const handleViewPatientHistory = (id: string) => {
		navigate(`/patient-history/${id}`);
	};

	const handleDeletePatient = async (id: string) => {
		try {
			if (!tenantId) {
				setAlertSeverity("error");
				setAlertMessage("Tenant ID não encontrado. Faça login novamente.");
				setAlertOpen(true);
				return;
			}

			const tenantService = createTenantService(tenantId);
			await tenantService.deletePatient(id);
			
			setAlertSeverity("success");
			setAlertMessage("Paciente excluído com sucesso!");
			setAlertOpen(true);
			// Atualizar a lista após excluir
			fetchPatients();
		} catch (err) {
			console.error("Erro ao excluir paciente:", err);
			setAlertSeverity("error");
			setAlertMessage("Falha ao excluir paciente. Tente novamente.");
			setAlertOpen(true);
		}
	};

	const handleOpenEMenu = (
		event: React.MouseEvent<HTMLElement>,
		id: string
	) => {
		setAnchorElE(event.currentTarget);
		setSelectedPatientId(id);
	};

	const handleOpenDMenu = (
		event: React.MouseEvent<HTMLElement>,
		id: string
	) => {
		setAnchorElD(event.currentTarget);
		setSelectedPatientId(id);
	};

	const handleCloseEMenu = () => {
		setAnchorElE(null);
		setSelectedPatientId(null);
	};

	const handleCloseDMenu = () => {
		setAnchorElD(null);
		setSelectedPatientId(null);
	};

	const handleEditLeftInsole = () => {
		if (selectedPatientId) {
			navigate(`/insole-editor/left/${selectedPatientId}`);
		}
		handleCloseEMenu();
	};

	const handleEditRightInsole = () => {
		if (selectedPatientId) {
			navigate(`/insole-editor/right/${selectedPatientId}`);
		}
		handleCloseDMenu();
	};

	const handleViewLeftInsole = () => {
		if (selectedPatientId) {
			navigate(`/insole-viewer/${selectedPatientId}/left`);
		}
		handleCloseEMenu();
	};

	const handleViewRightInsole = () => {
		if (selectedPatientId) {
			navigate(`/insole-viewer/${selectedPatientId}/right`);
		}
		handleCloseDMenu();
	};

	const handleCloseAlert = () => {
		setAlertOpen(false);
	};

	const filteredPatients = patients.filter(
		(patient) =>
			patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			patient.birthDate.includes(searchTerm) ||
			patient.phone.includes(searchTerm)
	);

	const getStatusChipColor = (status: string) => {
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

	return (
		<div className="patient-list-page">
			<Snackbar
				open={alertOpen}
				autoHideDuration={6000}
				onClose={handleCloseAlert}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Alert onClose={handleCloseAlert} severity={alertSeverity}>
					{alertMessage}
				</Alert>
			</Snackbar>

			<Container component="main" maxWidth={false}>
				<Box className="patient-list-actions">
					<Button
						variant="contained"
						color="primary"
						startIcon={<Add />}
						onClick={handleAddNewPatient}
						className="add-button"
					>
						Novo
					</Button>
				</Box>

				<Paper elevation={0} className="patient-list-search-paper">
					<Box className="patient-list-search">
						<TextField
							variant="outlined"
							placeholder="Pesquisa por: Nome, CPF"
							fullWidth
							value={searchTerm}
							onChange={handleSearch}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<Search />
									</InputAdornment>
								),
							}}
						/>
						<IconButton className="refresh-button" onClick={handleRefresh}>
							<Refresh />
						</IconButton>
					</Box>
				</Paper>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
						<CircularProgress />
					</Box>
				) : (
					<TableContainer
						component={Paper}
						className="patient-list-table-container"
					>
						<Table className="patient-list-table">
							<TableHead>
								<TableRow>
									<TableCell className="table-header-cell">
										<Box className="table-header-content">
											Data/hora <KeyboardArrowDown fontSize="small" />
										</Box>
									</TableCell>
									<TableCell className="table-header-cell">Paciente</TableCell>
									<TableCell className="table-header-cell">Palmilhas</TableCell>
									<TableCell className="table-header-cell">
										Plano
										<br />
										Frontal
									</TableCell>
									<TableCell className="table-header-cell">
										Plano
										<br />
										Posterior
									</TableCell>
									<TableCell className="table-header-cell">
										Plano
										<br />
										Sagital
									</TableCell>
									<TableCell className="table-header-cell">
										Pedido de produção
									</TableCell>
									<TableCell className="table-header-cell">Opções</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{filteredPatients.length === 0 ? (
									<TableRow>
										<TableCell colSpan={8} align="center">
											<Typography variant="body1" sx={{ py: 2 }}>
												Nenhum paciente encontrado
											</Typography>
										</TableCell>
									</TableRow>
								) : (
									filteredPatients.map((patient) => (
										<TableRow key={patient.id} className="patient-row">
											<TableCell className="date-cell">
												{patient.date} {patient.time}
											</TableCell>
											<TableCell>
												<Box className="patient-info">
													<Typography variant="body1">
														{patient.name} - {patient.gender}
													</Typography>
													<Typography variant="body2" color="textSecondary">
														{patient.age} anos ({patient.birthDate})
													</Typography>
													{patient.phone && (
														<Typography variant="body2" color="textSecondary">
															Telefone: {patient.phone}
														</Typography>
													)}
												</Box>
											</TableCell>
											<TableCell>
												<Box className="cell-with-buttons">
													<Button
														variant="contained"
														color="primary"
														size="small"
														className="insole-button"
														onClick={(e) => handleOpenEMenu(e, patient.id)}
													>
														E <KeyboardArrowDown fontSize="small" />
													</Button>
													<Button
														variant="contained"
														color="primary"
														size="small"
														className="insole-button"
														onClick={(e) => handleOpenDMenu(e, patient.id)}
													>
														D <KeyboardArrowDown fontSize="small" />
													</Button>
													<Typography variant="body2">
														Tênis {patient.shoeSize}
													</Typography>
												</Box>
											</TableCell>
											<TableCell>
												{patient.planFrontal ? (
													<Chip
														label="Sim"
														color="success"
														size="small"
														className="plan-chip"
													/>
												) : (
													<Chip
														label="Não"
														color="default"
														size="small"
														className="plan-chip"
													/>
												)}
											</TableCell>
											<TableCell>
												{patient.planPosterior ? (
													<Chip
														label="Sim"
														color="success"
														size="small"
														className="plan-chip"
													/>
												) : (
													<Chip
														label="Não"
														color="default"
														size="small"
														className="plan-chip"
													/>
												)}
											</TableCell>
											<TableCell>
												{patient.planSagital ? (
													<Chip
														label="Sim"
														color="success"
														size="small"
														className="plan-chip"
													/>
												) : (
													<Chip
														label="Não"
														color="default"
														size="small"
														className="plan-chip"
													/>
												)}
											</TableCell>
											<TableCell>
												<Chip
													label={patient.productionStatus}
													color={getStatusChipColor(patient.productionStatus)}
													size="small"
													className="status-chip"
												/>
											</TableCell>
											<TableCell>
												<Box className="action-buttons">
													<Tooltip title="Editar">
														<IconButton
															className="action-button edit-button"
															onClick={() => handleEditPatient(patient.id)}
														>
															<Edit />
														</IconButton>
													</Tooltip>
													<Tooltip title="Visualizar Histórico">
														<IconButton 
															className="action-button view-button"
															onClick={() => handleViewPatientHistory(patient.id)}
														>
															<Visibility />
														</IconButton>
													</Tooltip>
													<Tooltip title="Consulta">
														<IconButton
															className="action-button consultation-button"
															onClick={() =>
																navigate(`/consulta/${patient.id}`)
															}
														>
															<MedicalServices />
														</IconButton>
													</Tooltip>
													<Tooltip title="Excluir">
														<IconButton
															className="action-button delete-button"
															onClick={() => handleDeletePatient(patient.id)}
														>
															<Delete />
														</IconButton>
													</Tooltip>
													<Tooltip title="Mais opções">
														<IconButton className="action-button more-button">
															<Add />
														</IconButton>
													</Tooltip>
												</Box>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</TableContainer>
				)}
			</Container>

			{/* Menu para o botão E (Esquerda) */}
			<Menu
				anchorEl={anchorElE}
				open={Boolean(anchorElE)}
				onClose={handleCloseEMenu}
			>
				<MenuItem onClick={handleEditLeftInsole}>
					Editar palmilha Esquerda
				</MenuItem>
				<MenuItem onClick={handleViewLeftInsole}>Visualizar</MenuItem>
			</Menu>

			{/* Menu para o botão D (Direita) */}
			<Menu
				anchorEl={anchorElD}
				open={Boolean(anchorElD)}
				onClose={handleCloseDMenu}
			>
				<MenuItem onClick={handleEditRightInsole}>
					Editar palmilha Direita
				</MenuItem>
				<MenuItem onClick={handleViewRightInsole}>Visualizar</MenuItem>
			</Menu>
		</div>
	);
};

export default PatientList;
