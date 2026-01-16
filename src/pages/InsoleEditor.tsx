import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInsoleEditor } from "../contexts/InsoleEditorContext";
import { db } from "../services/firebaseconfig";
import { useAuth } from "../contexts/AuthContext";
import { createTenantService } from "../services/tenantService";
import { 
	getFootLengthFromShoeSize, 
	getPrintScaleFromShoeSize,
	MEASUREMENT_CONSTANTS 
} from "../services/insoleMeasurementsService";
import { 
	printInsole, 
	validatePrintConfig, 
	getPrintDebugInfo,
	testSizeCalculations,
	type PrintConfig,
	type PiecePosition,
	type PieceImages,
	type InsoleModel
} from "../services/insolePrintService";
import { pieceDimensionsService, type PieceDimensions } from "../services/pieceDimensionsService";
import { createInsoleService, type InsoleData } from "../services/insoleService";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardActions,
	Chip,
	CircularProgress,
	Container,
	Divider,
	Grid,
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
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Fab,
} from "@mui/material";
import {
	Print,
	Save,
	ArrowBack as ArrowBackIcon,
	ArrowForward as ArrowForwardIcon,
	CheckCircle,
	Info,
	List as ListIcon,
	Image,
	Settings,
	Done,
	Add,
	Remove,
	Refresh,
	Extension,
} from "@mui/icons-material";
import "../styles/InsoleEditor.scss";

// Imagens de peças
import arcpA from "../assets/images/pecas/p-ARCP-A.png";
import arcpB from "../assets/images/pecas/p-ARCP-B.png";
import brcp from "../assets/images/pecas/p-BRCP-L.png";
import btic from "../assets/images/pecas/p-BTIC-L.png";
import cbSDefault from "../assets/images/pecas/p-CB-S-default.png";
import cbSInverse from "../assets/images/pecas/p-CB-S-inverse.png";
import hcp from "../assets/images/pecas/p-HCP-L.png";
import supplement from "../assets/images/pecas/p-SUPPLEMENT-L.png";
import p11 from "../assets/images/pecas/p11.png";
import p13 from "../assets/images/pecas/p13.png";
import p14g from "../assets/images/pecas/p14g.png";
import p14p from "../assets/images/pecas/p14p.png";
import p17 from "../assets/images/pecas/p17.png";
import p18 from "../assets/images/pecas/p18.png";
import p19 from "../assets/images/pecas/p19.png";
import p1g from "../assets/images/pecas/p1g.png";
import p1p from "../assets/images/pecas/p1p.png";
import p20 from "../assets/images/pecas/p20.png";
import p21 from "../assets/images/pecas/p21.png";
import p3g from "../assets/images/pecas/p3g.png";
import p3p from "../assets/images/pecas/p3p.png";
import p5g from "../assets/images/pecas/p5g.png";
import p5p from "../assets/images/pecas/p5p.png";
import p7 from "../assets/images/pecas/p7.png";
import p8 from "../assets/images/pecas/p8.png";
import p9 from "../assets/images/pecas/p9.png";

interface DraggableItemPosition {
	id: string;
	x: number;
	y: number;
	width: number; // Largura da peça
	height: number; // Altura da peça
	rotation: number; // Rotação da peça em graus
}

interface GuidePosition {
	id: string;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

interface CirclePosition {
	id: string;
	cx: number;
	cy: number;
}

const CIRCLE_REF_SIZE = MEASUREMENT_CONSTANTS.CIRCLE_REF_SIZE;

// Definir os paths SVG para os pés esquerdo e direito
const INSOLE_PATH_LEFT =
	"M144.16,660.68C58.72,659.74,50,607.26,50,607.26S39.72,574.69,33,519.8,14.8,358.35,6.88,313.34-.72,217,6.36,163.54C10.08,135.42,41.64,3.94,119.24,1.08c86-3.17,108.13,88.61,113.93,171.43,5.07,72.3-2,107.23-4.35,198.72s4.75,185.16-.79,208.95S210.23,661.42,144.16,660.68Z";
const INSOLE_PATH_RIGHT =
	"M91.8,660.68c85.45-.94,94.16-53.42,94.16-53.42s10.28-32.57,17-87.46,18.19-161.45,26.11-206.46,7.6-96.38.52-149.8C225.88,135.42,194.33,3.94,116.73,1.08,30.75-2.09,8.59,89.69,2.79,172.51c-5.06,72.3,2,107.23,4.35,198.72S2.4,556.39,7.93,580.18,25.74,661.42,91.8,660.68Z";

// Função para retornar o path SVG correto baseado no lado do pé
const getInsolePath = (footId: "left" | "right") => {
	return footId === "left" ? INSOLE_PATH_LEFT : INSOLE_PATH_RIGHT;
};

const InsoleEditor: React.FC = () => {
	const { footSide, patientId } = useParams<{
		footSide: string;
		patientId: string;
	}>();
	const navigate = useNavigate();
	const { tenantId } = useAuth();
	const svgRef = useRef<SVGSVGElement>(null);
	const [dragging, setDragging] = useState<boolean>(false);
	const [selectedElement, setSelectedElement] = useState<SVGElement | null>(
		null
	);
	const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
	const [offset, setOffset] = useState<{ x: number; y: number }>({
		x: 0,
		y: 0,
	});
	const [piecePositions, setPiecePositions] = useState<DraggableItemPosition[]>(
		[]
	);
	const [guidesPositions, setGuidesPositions] = useState<GuidePosition[]>([
		{ id: "horizontal1", x1: 0, y1: -80, x2: 300, y2: -80 },
		{ id: "horizontal2", x1: 0, y1: 0, x2: 300, y2: 0 },
		{ id: "vertical", x1: 150, y1: 0, x2: 150, y2: 600 },
	]);
	const [circlePosition, setCirclePosition] = useState<CirclePosition>({
		id: "measureCircle",
		cx: 150,
		cy: 300,
	});
	const [hasUploadedImage, setHasUploadedImage] = useState<boolean>(false);
	const [uploadedImage, setUploadedImage] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [patientName, setPatientName] = useState<string>("");
	const [shoeSize, setShoeSize] = useState<number | undefined>(undefined);
	const [notes, setNotes] = useState<string>("");
	const [pieceDimensions, setPieceDimensions] = useState<Map<string, PieceDimensions>>(new Map());
	const [hoveredPiece, setHoveredPiece] = useState<string | null>(null);
	const [hoveredPieceMenu, setHoveredPieceMenu] = useState<string | null>(null);
	const [loadingDimensions, setLoadingDimensions] = useState<boolean>(true);
	const [saving, setSaving] = useState<boolean>(false);

	// Usando o contexto do editor
	const {
		currentModel,
		currentStep,
		setCurrentStep,
		selectedPieces,
		setSelectedPieces,
		guidePositions,
		setGuidePositions,
		measureCircle,
		setMeasureCircle,
		backgroundPosition,
		setBackgroundPosition,
		createNewModel,
		saveModel,
		updateBackgroundImage,
		updateShoeSize,
		loadModel,
	} = useInsoleEditor();

	// Adicionar controle de dimensionamento e rotação das peças
	const [activeAction, setActiveAction] = useState<
		"move" | "resize" | "rotate" | null
	>(null);

	// Adicionar estado para rastrear qual alça de redimensionamento está sendo usada
	const [resizeHandlePosition, setResizeHandlePosition] = useState<
		string | null
	>(null);

	// Adicionar uma ref para o ponto inicial do drag (útil para redimensionamento)
	const startDragPointRef = useRef<{ x: number; y: number } | null>(null);

	// Buscar informações do paciente
	useEffect(() => {
		const fetchPatientData = async () => {
			if (patientId && tenantId) {
				try {
					const tenantService = createTenantService(tenantId);
					const patientData = await tenantService.getPatient(patientId);
					if (patientData) {
						setPatientName(patientData.name || "Paciente");
					} else {
						console.log("Paciente não encontrado");
						setPatientName("Paciente desconhecido");
					}
				} catch (error) {
					console.error("Erro ao buscar dados do paciente:", error);
				}
			}
		};

		fetchPatientData();
	}, [patientId, tenantId]);

	// Corrigir o loop infinito no useEffect
	useEffect(() => {
		const initializeEditor = async () => {
			if (footSide && patientId && tenantId) {
				try {
					console.log(
						"Inicializando editor para o pé:",
						footSide,
						"paciente:",
						patientId,
						"tenant:",
						tenantId
					);
					
					// Primeiro, tentar carregar palmilha existente
					await loadExistingInsole();
					
					// Se não há modelo atual, criar um novo
					if (!currentModel) {
						const modelId = `insole-${patientId}-${footSide}`;
						await loadModel(modelId, patientId, footSide as "left" | "right");
					}
				} catch (error) {
					console.error("Erro ao inicializar editor:", error);
					// Fallback: criar um novo modelo se algo der errado
					if (!currentModel) {
						createNewModel(
							footSide as "left" | "right",
							patientId,
							patientName || "Paciente"
						);
					}
				}
			}
		};

		initializeEditor();
	}, [
		footSide,
		patientId,
		tenantId,
		patientName,
		loadModel,
		createNewModel,
		currentModel,
	]);

	// Carregar dimensões de todas as peças disponíveis
	useEffect(() => {
		const loadAllPieceDimensions = async () => {
			setLoadingDimensions(true);
			try {
				// Carregar dimensões de todas as peças disponíveis, não apenas as selecionadas
				const allPieceIds = availablePieces.map(piece => piece.id);
				console.log('Carregando dimensões para peças:', allPieceIds);
				
				// Buscar dimensões de todas as peças de uma vez
				const dimensionsMap = await pieceDimensionsService.getMultiplePieceDimensions(allPieceIds);
				console.log('Dimensões carregadas:', dimensionsMap);
				
				// Se não conseguiu carregar todas, tentar carregar uma por uma
				if (dimensionsMap.size < allPieceIds.length) {
					console.log('Carregando dimensões individuais...');
					const missingIds = allPieceIds.filter(id => !dimensionsMap.has(id));
					
					for (const pieceId of missingIds) {
						try {
							const dimension = await pieceDimensionsService.getPieceDimensions(pieceId);
							if (dimension) {
								dimensionsMap.set(pieceId, dimension);
							}
						} catch (error) {
							console.warn(`Erro ao carregar dimensões da peça ${pieceId}:`, error);
						}
					}
				}
				
				setPieceDimensions(dimensionsMap);
				console.log('Total de dimensões carregadas:', dimensionsMap.size);
			} catch (error) {
				console.error('Erro ao carregar dimensões das peças:', error);
			} finally {
				setLoadingDimensions(false);
			}
		};

		loadAllPieceDimensions();
	}, []); // Executar apenas uma vez quando o componente montar

	// Corrigir a dependência do useEffect para peças
	useEffect(() => {
		// Só inicializa posições se houver peças selecionadas
		if (selectedPieces.length === 0) return;

		// Use uma função de atualização para evitar dependência no estado anterior
		setPiecePositions((prevPositions) => {
			const existingPositions = new Map(
				prevPositions.map((pos) => [pos.id, pos])
			);

			return selectedPieces.map((pieceId) => {
				// Verificar se a peça já tem uma posição
				if (existingPositions.has(pieceId)) {
					return existingPositions.get(pieceId)!;
				}

				// Obter dimensões reais da peça
				const dimensions = pieceDimensions.get(pieceId);
				const shoeSizeValue = shoeSize || currentModel?.shoeSize || 41;
				
				// Calcular dimensões reais baseadas no tamanho do calçado
				let width = 50;
				let height = 50;
				
				if (dimensions) {
					const realScale = pieceDimensionsService.calculateRealScale(shoeSizeValue, dimensions);
					width = realScale.width;
					height = realScale.height;
				}

				// Posições iniciais baseadas no ID da peça
				let x = 150;
				let y = 300;
				let rotation = 0;

				switch (pieceId) {
					case "p-SUPPLEMENT-L":
						y = 50;
						break;
					case "p1p":
						y = 120;
						break;
					case "p1g":
						y = 170;
						break;
					case "p3p":
						y = 220;
						break;
					case "p3g":
						y = 270;
						break;
					case "p-HCP-L":
						x = 180;
						y = 350;
						break;
					case "p-BTIC-L":
						x = 80;
						y = 350;
						break;
					case "p-BRCP-L":
						y = 400;
						break;
					case "p-ARCP-A":
						x = 90;
						y = 500;
						break;
					case "p-ARCP-B":
						x = 150;
						y = 500;
						break;
				}

				return { id: pieceId, x, y, width, height, rotation };
			});
		});
	}, [selectedPieces, pieceDimensions, shoeSize, currentModel?.shoeSize]);

	// Sincronizar uploadedImage com currentModel.backgroundImage
	useEffect(() => {
		if (currentModel && currentModel.backgroundImage) {
			setUploadedImage(currentModel.backgroundImage);
			setHasUploadedImage(true);
		}
	}, [currentModel]);

	// Helper function to generate names (pode ser melhorada)
	const generatePieceName = (id: string): string => {
		let name = id.replace(/^p-|-L$/g, "").replace(/-/g, " "); // Remove prefixos/sufixos comuns
		if (/^p\d+[gp]$/.test(id)) {
			// Para p1g, p1p, etc.
			name = id.replace(/^p/, "P ").replace(/g$/, " G").replace(/p$/, " P");
		}
		return name.toUpperCase(); // Deixa em maiúsculo
	};

	// Peças disponíveis para seleção - Agora baseada nos imports
	const availablePieces = [
		{
			id: "p-SUPPLEMENT-L",
			name: generatePieceName("p-SUPPLEMENT-L"),
			image: supplement,
		},
		{ id: "p1p", name: generatePieceName("p1p"), image: p1p }, // SAT P
		{ id: "p1g", name: generatePieceName("p1g"), image: p1g }, // SAT G
		{ id: "p3p", name: generatePieceName("p3p"), image: p3p }, // SPA P
		{ id: "p3g", name: generatePieceName("p3g"), image: p3g }, // SPA G
		{ id: "p5p", name: generatePieceName("p5p"), image: p5p }, // Nova
		{ id: "p5g", name: generatePieceName("p5g"), image: p5g }, // Nova
		{ id: "p-HCP-L", name: generatePieceName("p-HCP-L"), image: hcp },
		{ id: "p-BTIC-L", name: generatePieceName("p-BTIC-L"), image: btic },
		{ id: "p-BRCP-L", name: generatePieceName("p-BRCP-L"), image: brcp },
		{ id: "p-ARCP-A", name: generatePieceName("p-ARCP-A"), image: arcpA }, // ARCP ext.
		{ id: "p-ARCP-B", name: generatePieceName("p-ARCP-B"), image: arcpB }, // ARCP int.
		{
			id: "p-CB-S-default",
			name: generatePieceName("p-CB-S-default"),
			image: cbSDefault,
		}, // Nova
		{
			id: "p-CB-S-inverse",
			name: generatePieceName("p-CB-S-inverse"),
			image: cbSInverse,
		}, // Nova
		{ id: "p7", name: generatePieceName("p7"), image: p7 }, // Nova
		{ id: "p8", name: generatePieceName("p8"), image: p8 }, // Nova
		{ id: "p9", name: generatePieceName("p9"), image: p9 }, // Nova
		{ id: "p11", name: generatePieceName("p11"), image: p11 }, // Nova
		{ id: "p13", name: generatePieceName("p13"), image: p13 }, // Nova
		{ id: "p14p", name: generatePieceName("p14p"), image: p14p }, // Nova
		{ id: "p14g", name: generatePieceName("p14g"), image: p14g }, // Nova
		{ id: "p17", name: generatePieceName("p17"), image: p17 }, // Nova
		{ id: "p18", name: generatePieceName("p18"), image: p18 }, // Nova
		{ id: "p19", name: generatePieceName("p19"), image: p19 }, // Nova
		{ id: "p20", name: generatePieceName("p20"), image: p20 }, // Nova
		{ id: "p21", name: generatePieceName("p21"), image: p21 }, // Nova
	];

	// Mapeia ID da peça para URL da imagem - Construído dinamicamente a partir de availablePieces
	const pieceImages: Record<string, string> = availablePieces.reduce((acc, piece) => {
		acc[piece.id] = piece.image;
		return acc;
	}, {} as Record<string, string>);

	// Passos do processo de edição
	const steps = [
		{ label: "Informações", content: "Informações do Paciente" },
		{ label: "Upload", content: "Upload da Imagem" },
		{ label: "Enquadramento", content: "Enquadramento da Palmilha" },
		{ label: "Guias", content: "Ajuste das Guias" },
		{ label: "Peças", content: "Seleção de Peças" },
	];

	// Melhorar a função de navegação para dar feedback visual ao usuário
	// e preservar as configurações dos passos anteriores
	const goToStep = (step: number) => {
		if (step >= 0 && step < steps.length) {
			// Feedback visual destacando a etapa na barra de progresso
			const progressBar = document.querySelector(".progress-bar");
			if (progressBar) {
				progressBar.classList.add("changing-step");
				setTimeout(() => {
					progressBar.classList.remove("changing-step");
				}, 500);
			}

			// Atualizar a etapa - usando a função do contexto que já salva as configurações
			setCurrentStep(step);
			console.log("Navegando para etapa:", step);

			// Rolar para o topo suavemente
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	// Otimizar o togglePiece para usar funções de atualização de estado
	const togglePiece = (pieceId: string) => {
		if (selectedPieces.includes(pieceId)) {
			setSelectedPieces((prev) => prev.filter((id) => id !== pieceId));
			setPiecePositions((prev) => prev.filter((pos) => pos.id !== pieceId));
		} else {
			setSelectedPieces((prev) => [...prev, pieceId]);
		}
	};

	// Modificar a função de iniciar arrasto para respeitar o passo atual
	const startDrag = (evt: React.MouseEvent<SVGElement>) => {
		if (!svgRef.current) return;

		const target = evt.target as SVGElement;
		const targetId = target.id || target.dataset.id;

		const svg = svgRef.current;
		const svgPoint = svg.createSVGPoint();
		svgPoint.x = evt.clientX;
		svgPoint.y = evt.clientY;
		const transformedPoint = svgPoint.matrixTransform(
			svg.getScreenCTM()?.inverse()
		);

		// Etapa 2: arrastar imagem
		if (currentStep === 2) {
			setDragging(true);
			setSelectedElement(target);
			setActiveAction("move");
			setOffset({
				x: transformedPoint.x - backgroundPosition.x,
				y: transformedPoint.y - backgroundPosition.y,
			});
			return;
		}

		// Etapa 3: só arrasta se for guide-handle
		if (currentStep === 3) {
			if (target.classList.contains("guide-handle")) {
				setDragging(true);
				setSelectedElement(target);
				setActiveAction("move");
				setOffset({
					x: transformedPoint.x - Number(target.getAttribute("cx")),
					y: transformedPoint.y - Number(target.getAttribute("cy")),
				});
				return;
			}
			return;
		}

		// Etapa 4: arrastar peça ou redimensionar
		if (currentStep === 4) {
			if (target.classList.contains("piece-image")) {
				const pieceId = target.id;
				const piecePos = piecePositions.find((pos) => pos.id === pieceId);
				if (piecePos) {
					setDragging(true);
					setSelectedElement(target);
					setSelectedPieceId(pieceId);
					setActiveAction("move");
					setOffset({
						x: transformedPoint.x - piecePos.x,
						y: transformedPoint.y - piecePos.y,
					});
					return;
				}
			} else if (target.classList.contains("resize-handle")) {
				const pieceId = target.dataset.pieceId;
				const handlePosition = target.dataset.position;
				if (pieceId && handlePosition) {
					setDragging(true);
					setSelectedElement(target);
					setSelectedPieceId(pieceId);
					setActiveAction("resize");
					setResizeHandlePosition(handlePosition);
					return;
				}
			}
			return;
		}

		// Lógica para Etapa 5 (Peças)
		if (currentStep === 5) {
			const pieceId =
				target.dataset.pieceId ||
				(target.tagName === "image" ? target.id : null);
			const isResizeHandle = target.classList.contains("resize-handle");
			const isRotateHandle = target.classList.contains("rotate-handle");

			if (pieceId && piecePositions.some((pos) => pos.id === pieceId)) {
				const piecePos = piecePositions.find((pos) => pos.id === pieceId)!;
				setDragging(true);
				setSelectedElement(target); // Seleciona a peça ou a alça
				setSelectedPieceId(pieceId); // Mantém a peça visualmente selecionada

				if (isResizeHandle) {
					setActiveAction("resize");
					const handlePosition = target.dataset.position;
					if (handlePosition) setResizeHandlePosition(handlePosition);
					console.log("Iniciando REDIMENSIONAMENTO da peça:", pieceId);
				} else if (isRotateHandle) {
					setActiveAction("rotate");
					console.log("Iniciando ROTAÇÃO da peça:", pieceId);
				} else {
					setActiveAction("move");
					// Offset para mover a peça
					setOffset({
						x: transformedPoint.x - piecePos.x,
						y: transformedPoint.y - piecePos.y,
					});
					console.log("Iniciando MOVIMENTO da peça:", pieceId);
				}
				return;
			}
			// Se não for peça ou alça, não fazer nada na etapa 5
			console.log("Clique ignorado na etapa 5 (não é peça/alça)");
			return;
		}

		// Se chegou aqui, o clique não é relevante para a etapa atual
		console.log(
			"Clique ignorado - Etapa não relevante ou elemento não interativo."
		);
	};

	// Clique fora de uma peça para desselecionar
	const handleBackgroundClick = (evt: React.MouseEvent<SVGElement>) => {
		const target = evt.target as SVGElement;
		// Se clicar no fundo ou em elementos que não são peças, desseleciona
		if (
			target.tagName === "svg" ||
			target.classList.contains("insole-svg-container") ||
			target.classList.contains("insole-background")
		) {
			setSelectedPieceId(null);
		}
	};

	// Modificar a função de arrasto para respeitar o passo atual e melhorar redimensionamento
	const drag = (evt: React.MouseEvent<SVGElement>) => {
		if (!dragging || !svgRef.current) return;
		evt.preventDefault();
		const svg = svgRef.current;
		const svgPoint = svg.createSVGPoint();
		svgPoint.x = evt.clientX;
		svgPoint.y = evt.clientY;
		const currentTransformedPoint = svgPoint.matrixTransform(
			svg.getScreenCTM()?.inverse()
		);
		if (!startDragPointRef.current) {
			startDragPointRef.current = currentTransformedPoint;
		}

		// Etapa 2: arrastar imagem
		if (currentStep === 2) {
			const newX = currentTransformedPoint.x - offset.x;
			const newY = currentTransformedPoint.y - offset.y;
			setBackgroundPosition((prev) => ({ ...prev, x: newX, y: newY }));
			return;
		}

		// Etapa 3: arrastar apenas a guide-handle selecionada
		if (
			currentStep === 3 &&
			selectedElement &&
			selectedElement.classList.contains("guide-handle")
		) {
			const guideId = selectedElement.dataset.guideId;
			const handleType = selectedElement.dataset.id?.includes("-start")
				? "start"
				: "end";
			setGuidePositions((prev) =>
				prev.map((guide) => {
					if (guide.id === guideId) {
						if (handleType === "start") {
							return {
								...guide,
								x1: currentTransformedPoint.x,
								y1: currentTransformedPoint.y,
							};
						} else {
							return {
								...guide,
								x2: currentTransformedPoint.x,
								y2: currentTransformedPoint.y,
							};
						}
					}
					return guide;
				})
			);
			return;
		}

		// Etapa 4: arrastar peça selecionada
		if (currentStep === 4 && selectedElement) {
			if (selectedElement.classList.contains("piece-image")) {
				const pieceId = selectedElement.id;
				setPiecePositions((prev) =>
					prev.map((pos) =>
						pos.id === pieceId
							? {
									...pos,
									x: currentTransformedPoint.x - offset.x,
									y: currentTransformedPoint.y - offset.y,
							  }
							: pos
					)
				);
				return;
			} else if (
				selectedElement.classList.contains("resize-handle") &&
				resizeHandlePosition &&
				startDragPointRef.current
			) {
				const pieceId = selectedElement.dataset.pieceId;
				setPiecePositions((prev) =>
					prev.map((pos) => {
						if (pos.id === pieceId) {
							const pieceCenterX = pos.x;
							const pieceCenterY = pos.y;
							const originalWidth = pos.width;
							const originalHeight = pos.height;
							const rotationRad = pos.rotation * (Math.PI / 180);
							// Transformar o ponto atual do mouse para o sistema de coordenadas da peça (sem rotação)
							const dx = currentTransformedPoint.x - pieceCenterX;
							const dy = currentTransformedPoint.y - pieceCenterY;
							const mouseXInPieceCoords =
								dx * Math.cos(-rotationRad) - dy * Math.sin(-rotationRad);
							const mouseYInPieceCoords =
								dx * Math.sin(-rotationRad) + dy * Math.cos(-rotationRad);
							let newWidth = originalWidth;
							let newHeight = originalHeight;
							// Calcular nova dimensão baseada na alça e posição do mouse no sistema da peça
							if (resizeHandlePosition.includes("right")) {
								newWidth = Math.max(20, mouseXInPieceCoords * 2);
							} else if (resizeHandlePosition.includes("left")) {
								newWidth = Math.max(20, -mouseXInPieceCoords * 2);
							}
							if (resizeHandlePosition.includes("bottom")) {
								newHeight = Math.max(20, mouseYInPieceCoords * 2);
							} else if (resizeHandlePosition.includes("top")) {
								newHeight = Math.max(20, -mouseYInPieceCoords * 2);
							}
							// Manter proporção com Shift
							if (evt.shiftKey) {
								const originalRatio = originalWidth / originalHeight;
								const currentRatio = newWidth / newHeight;
								if (currentRatio > originalRatio) {
									newWidth = newHeight * originalRatio;
								} else {
									newHeight = newWidth / originalRatio;
								}
							}
							return { ...pos, width: newWidth, height: newHeight };
						}
						return pos;
					})
				);
				return;
			}
		}

		// Lógica para Etapa 5 (Peças)
		if (currentStep === 5 && selectedElement && activeAction) {
			const pieceId = selectedElement.dataset.pieceId || selectedElement.id;
			const originalPosition = piecePositions.find((p) => p.id === pieceId);

			if (!originalPosition) return; // Peça não encontrada

			if (activeAction === "move") {
				setPiecePositions((prev) =>
					prev.map((pos) =>
						pos.id === pieceId
							? {
									...pos,
									x: currentTransformedPoint.x - offset.x,
									y: currentTransformedPoint.y - offset.y,
							  }
							: pos
					)
				);
			} else if (
				activeAction === "resize" &&
				resizeHandlePosition &&
				startDragPointRef.current
			) {
				// Cálculo de redimensionamento mais robusto
				setPiecePositions((prev) =>
					prev.map((pos) => {
						if (pos.id === pieceId) {
							const pieceCenterX = pos.x;
							const pieceCenterY = pos.y;
							const originalWidth = pos.width;
							const originalHeight = pos.height;
							const rotationRad = pos.rotation * (Math.PI / 180);

							// Transformar o ponto atual do mouse para o sistema de coordenadas da peça (sem rotação)
							const dx = currentTransformedPoint.x - pieceCenterX;
							const dy = currentTransformedPoint.y - pieceCenterY;
							const mouseXInPieceCoords =
								dx * Math.cos(-rotationRad) - dy * Math.sin(-rotationRad);
							const mouseYInPieceCoords =
								dx * Math.sin(-rotationRad) + dy * Math.cos(-rotationRad);

							let newWidth = originalWidth;
							let newHeight = originalHeight;

							// Calcular nova dimensão baseada na alça e posição do mouse no sistema da peça
							if (resizeHandlePosition.includes("right")) {
								newWidth = Math.max(20, mouseXInPieceCoords * 2);
							} else if (resizeHandlePosition.includes("left")) {
								newWidth = Math.max(20, -mouseXInPieceCoords * 2);
							}

							if (resizeHandlePosition.includes("bottom")) {
								newHeight = Math.max(20, mouseYInPieceCoords * 2);
							} else if (resizeHandlePosition.includes("top")) {
								newHeight = Math.max(20, -mouseYInPieceCoords * 2);
							}

							// Manter proporção com Shift
							if (evt.shiftKey) {
								const originalRatio = originalWidth / originalHeight;
								const currentRatio = newWidth / newHeight;

								if (currentRatio > originalRatio) {
									// Largura está "esticando" mais
									newWidth = newHeight * originalRatio;
								} else {
									// Altura está "esticando" mais
									newHeight = newWidth / originalRatio;
								}
							}

							return { ...pos, width: newWidth, height: newHeight };
						}
						return pos;
					})
				);
			} else if (activeAction === "rotate") {
				setPiecePositions((prev) =>
					prev.map((pos) => {
						if (pos.id === pieceId) {
							const dx = currentTransformedPoint.x - pos.x;
							const dy = currentTransformedPoint.y - pos.y;
							const angle = Math.atan2(dx, -dy) * (180 / Math.PI);
							return { ...pos, rotation: angle };
						}
						return pos;
					})
				);
			}
			return;
		}
	};

	// Limpar estados ao finalizar o arrasto
	const endDrag = () => {
		setDragging(false);
		setSelectedElement(null);
		setActiveAction(null);
		setResizeHandlePosition(null);
		startDragPointRef.current = null; // Limpar ponto inicial
		// Mantém o selectedPieceId para continuar mostrando as alças
	};

	// Manipulador de upload de imagem
	const handleImageUpload = (e: any) => {
		let file;
		if (e.target && e.target.files) {
			file = e.target.files[0];
		} else if (e.dataTransfer && e.dataTransfer.files) {
			file = e.dataTransfer.files[0];
		}
		if (file) {
			const reader = new FileReader();
			reader.onload = (evt) => {
				const result = evt.target?.result as string;
				updateBackgroundImage(result);
				console.log("Imagem carregada com sucesso!");
			};
			reader.readAsDataURL(file);
		}
	};

	// Gatilho para o input de arquivo ao clicar na área de upload
	const triggerFileInput = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	// Simular um enquadramento de imagem automático
	const handleFrameImage = () => {
		// Na prática, isso poderia ajustar automaticamente a SVG para melhor enquadrar a imagem
		alert(
			"Imagem enquadrada com sucesso. Você pode continuar para a próxima etapa."
		);
		goToStep(currentStep + 1);
	};

	// Carregar palmilha existente
	const loadExistingInsole = async () => {
		if (!tenantId || !patientId || !footSide) return;

		try {
			const insoleService = createInsoleService(tenantId);
			const insoleData = await insoleService.loadInsoleByPatient(
				patientId, 
				footSide as 'left' | 'right'
			);

			if (insoleData) {
				console.log('Palmilha existente encontrada:', insoleData);
				
				// Restaurar dados da palmilha
				setPatientName(insoleData.patientName);
				setShoeSize(insoleData.shoeSize);
				setNotes(insoleData.notes);
				
				// Restaurar posição da imagem de fundo
				if (insoleData.backgroundPosition) {
					setBackgroundPosition(insoleData.backgroundPosition);
				}
				
				// Restaurar guias
				if (insoleData.guidePositions) {
					setGuidePositions(insoleData.guidePositions);
				}
				
				// Restaurar círculo de referência
				if (insoleData.measureCircle) {
					setMeasureCircle(insoleData.measureCircle);
				}
				
				// Restaurar peças selecionadas e posições
				if (insoleData.selectedPieces) {
					setSelectedPieces(insoleData.selectedPieces);
				}
				
				if (insoleData.piecePositions) {
					setPiecePositions(insoleData.piecePositions.map(pos => ({
						id: pos.id,
						x: pos.x,
						y: pos.y,
						width: pos.width,
						height: pos.height,
						rotation: pos.rotation,
					})));
				}
				
				// Restaurar imagem de fundo se existir
				if (insoleData.backgroundImageUrl) {
					updateBackgroundImage(insoleData.backgroundImageUrl);
				}
				
				console.log('Palmilha carregada com sucesso');
			} else {
				console.log('Nenhuma palmilha existente encontrada');
			}
		} catch (error) {
			console.error('Erro ao carregar palmilha existente:', error);
		}
	};

	// Salva o modelo de palmilha
	const handleSaveInsole = async () => {
		if (!tenantId || !patientId || !footSide) {
			alert("Erro: dados do tenant, paciente ou lado do pé não encontrados.");
			return;
		}

		setSaving(true);
		try {
			const insoleService = createInsoleService(tenantId);
			
			// Preparar dados da palmilha
			const insoleData: Omit<InsoleData, 'id' | 'createdAt' | 'updatedAt'> = {
				patientId,
				patientName: patientName || "Paciente",
				footSide: footSide as 'left' | 'right',
				shoeSize: shoeSize || currentModel?.shoeSize || 41,
				notes,
				backgroundImageUrl: currentModel?.backgroundImage || undefined,
				backgroundPosition: {
					x: backgroundPosition.x,
					y: backgroundPosition.y,
					scale: backgroundPosition.scale,
				},
				guidePositions: guidePositions.map(guide => ({
					id: guide.id,
					x1: guide.x1,
					y1: guide.y1,
					x2: guide.x2,
					y2: guide.y2,
				})),
				measureCircle: {
					cx: measureCircle.cx,
					cy: measureCircle.cy,
				},
				selectedPieces: [...selectedPieces],
				piecePositions: piecePositions.map(pos => ({
					id: pos.id,
					x: pos.x,
					y: pos.y,
					width: pos.width,
					height: pos.height,
					rotation: pos.rotation,
				})),
				tenantId,
				createdBy: tenantId, // Usar tenantId como criador por enquanto
			};

			// Salvar palmilha
			const savedInsoleId = await insoleService.saveInsole(insoleData);
			
			console.log('Palmilha salva com sucesso:', savedInsoleId);
			alert("Modelo de palmilha salvo com sucesso!");
			
			// Redirecionar para a lista de pacientes
			navigate("/patient-list");
		} catch (error) {
			console.error("Erro ao salvar o modelo:", error);
			alert("Ocorreu um erro ao salvar o modelo. Tente novamente.");
		} finally {
			setSaving(false);
		}
	};

	// Função para imprimir a palmilha (apenas contorno + peças)
	const handlePrintInsole = async () => {
		try {
			// Obter o tamanho do calçado (se disponível)
			const shoeSizeValue = currentModel?.shoeSize || shoeSize;
			
			// Preparar configuração de impressão
			const printConfig: PrintConfig = {
				shoeSize: shoeSizeValue || 41, // Fallback para tamanho 41 se não definido
				piecePositions: piecePositions,
				pieceImages: pieceImages,
				currentModel: currentModel,
				guidePositions: guidePositions
			};

			// Validar configuração
			const validation = validatePrintConfig(printConfig);
			if (!validation.isValid) {
				alert(validation.errorMessage);
				return;
			}

			// Log de debug detalhado
			const debugInfo = getPrintDebugInfo(printConfig);
			console.log('Informações de impressão:', debugInfo);
			console.log('Peças selecionadas:', selectedPieces);
			console.log('Posições das peças:', piecePositions);
			console.log('Imagens das peças:', pieceImages);
			
			// Teste adicional dos cálculos
			testSizeCalculations(shoeSizeValue || 41);

			// Imprimir usando o serviço
			await printInsole(printConfig);
			
		} catch (error) {
			console.error('Erro ao imprimir palmilha:', error);
			alert('Ocorreu um erro ao imprimir a palmilha. Tente novamente.');
		}
	};

	// Adicionar controles de zoom para o enquadramento da imagem
	const handleZoomChange = (delta: number) => {
		setBackgroundPosition((prev) => ({
			...prev,
			scale: Math.max(0.5, Math.min(2, prev.scale + delta * 0.1)),
		}));
	};

	// Atualizar a função renderBackgroundImage para tornar a imagem arrastável nas etapas 2 e 3
	const renderBackgroundImage = () => {
		if (!currentModel?.backgroundImage) return null;

		const isDraggable = currentStep === 2 || currentStep === 3;

		return (
			<g
				className="background-container"
				style={{ pointerEvents: isDraggable ? "all" : "none" }} // Container principal captura eventos nas etapas 2 e 3
			>
				{/* Retângulo transparente opcional para garantir área de clique, mas a imagem deve funcionar */}
				{/* <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0)" /> */}
				<image
					href={currentModel.backgroundImage}
					className={"foot-background"} // Classe base, estilo de cursor será aplicado via CSS ou style
					x={backgroundPosition.x}
					y={backgroundPosition.y}
					width={300 * backgroundPosition.scale} // Assumindo largura base 300
					height={600 * backgroundPosition.scale} // Assumindo altura base 600
					preserveAspectRatio="xMidYMid meet"
					style={{
						cursor: isDraggable ? "move" : "default",
						pointerEvents: isDraggable ? "all" : "none", // Imagem também captura eventos nas etapas 2 e 3
						opacity: 0.9, // Manter opacidade
					}}
					// Não precisamos mais da classe 'draggable' aqui se o estilo é aplicado diretamente
				/>
			</g>
		);
	};

	// Renderizar peças com alças de redimensionamento
	const renderPiece = (position: DraggableItemPosition) => {
		const pieceImage = pieceImages[position.id];
		if (!pieceImage) return null;

		const isSelected = selectedPieceId === position.id;
		const isHovered = hoveredPiece === position.id;
		const dimensions = pieceDimensions.get(position.id);

		return (
			<g
				key={position.id}
				transform={`translate(${position.x}, ${position.y}) rotate(${position.rotation})`}
			>
				<image
					id={position.id}
					data-id={position.id}
					href={pieceImage}
					x={-position.width / 2}
					y={-position.height / 2}
					height={position.height}
					width={position.width}
					className={`draggable piece-image ${isSelected ? "selected" : ""}`}
					style={{ pointerEvents: "all" }}
					onMouseEnter={() => setHoveredPiece(position.id)}
					onMouseLeave={() => setHoveredPiece(null)}
				/>

				{/* Tooltip com dimensões */}
				{isHovered && dimensions && (
					<g>
						{/* Fundo do tooltip */}
						<rect
							x={-position.width / 2 - 5}
							y={-position.height / 2 - 35}
							width="120"
							height="30"
							fill="rgba(0, 0, 0, 0.8)"
							rx="4"
							ry="4"
						/>
						{/* Texto do tooltip */}
						<text
							x={-position.width / 2}
							y={-position.height / 2 - 20}
							fill="white"
							fontSize="10"
							fontWeight="bold"
						>
							{dimensions.thickness}mm × {dimensions.width}cm × {dimensions.depth}cm
						</text>
						<text
							x={-position.width / 2}
							y={-position.height / 2 - 8}
							fill="white"
							fontSize="8"
						>
							{dimensions.material || 'EVA'}
						</text>
					</g>
				)}

				{/* Alças para redimensionamento e rotação - visíveis apenas quando a peça está selecionada */}
				{isSelected && (
					<>
						{/* Alças para os cantos */}
						<circle
							cx={position.width / 2}
							cy={position.height / 2}
							r="10"
							className="resize-handle"
							data-piece-id={position.id}
							data-position="bottom-right"
							style={{ pointerEvents: "all" }}
						/>

						<circle
							cx={-position.width / 2}
							cy={position.height / 2}
							r="10"
							className="resize-handle"
							data-piece-id={position.id}
							data-position="bottom-left"
							style={{ pointerEvents: "all" }}
						/>

						<circle
							cx={position.width / 2}
							cy={-position.height / 2}
							r="10"
							className="resize-handle"
							data-piece-id={position.id}
							data-position="top-right"
							style={{ pointerEvents: "all" }}
						/>

						<circle
							cx={-position.width / 2}
							cy={-position.height / 2}
							r="10"
							className="resize-handle"
							data-piece-id={position.id}
							data-position="top-left"
							style={{ pointerEvents: "all" }}
						/>

						{/* Alça para rotação */}
						<circle
							cx={0}
							cy={-position.height / 2 - 15}
							r="10"
							className="rotate-handle"
							data-piece-id={position.id}
							style={{ pointerEvents: "all" }}
						/>

						{/* Linha indicativa para rotação */}
						<line
							x1={0}
							y1={0}
							x2={0}
							y2={-position.height / 2 - 15}
							stroke="#ff9800"
							strokeWidth="2"
							strokeDasharray="3,3"
							pointerEvents="none"
						/>
					</>
				)}
			</g>
		);
	};

	// Permitir remover peça selecionada com Delete ou Backspace na etapa 4 e girar com setas
	useEffect(() => {
		if (currentStep !== 4 || !selectedPieceId) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Delete" || e.key === "Backspace") {
				setSelectedPieces((prev) =>
					prev.filter((id) => id !== selectedPieceId)
				);
				setPiecePositions((prev) =>
					prev.filter((pos) => pos.id !== selectedPieceId)
				);
				setSelectedPieceId(null);
			} else if (e.key === "ArrowLeft") {
				setPiecePositions((prev) =>
					prev.map((pos) =>
						pos.id === selectedPieceId
							? { ...pos, rotation: (pos.rotation || 0) - 5 }
							: pos
					)
				);
			} else if (e.key === "ArrowRight") {
				setPiecePositions((prev) =>
					prev.map((pos) =>
						pos.id === selectedPieceId
							? { ...pos, rotation: (pos.rotation || 0) + 5 }
							: pos
					)
				);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [currentStep, selectedPieceId, setSelectedPieces, setPiecePositions]);

	// Ao selecionar uma peça, foque o svgRef.current
	useEffect(() => {
		if (currentStep === 4 && selectedPieceId && svgRef.current) {
			svgRef.current.focus();
		}
	}, [currentStep, selectedPieceId]);

	if (!currentModel) {
		return <div className="loading">Carregando editor...</div>;
	}

	return (
		<Box sx={{ 
			minHeight: '100vh', 
			display: 'flex', 
			flexDirection: 'column',
			backgroundColor: '#f5f5f5'
		}}>
			<div className="insole-editor-container" style={{ 
				flex: 1, 
				paddingBottom: '120px',
				minHeight: 'calc(100vh - 200px)'
			}}>
			<div className="progress-bar">
				{steps.map((step, index) => (
					<div
						key={index}
						className={`step ${currentStep === index ? "active" : ""} ${
							currentStep > index ? "completed" : ""
						}`}
						onClick={() => goToStep(index)}
					>
						<span>{step.content}</span>
					</div>
				))}
			</div>

			<div className="editor-content">
				{currentStep === 0 && (
					<div className="step-content">
						<h3>Informações básicas</h3>
						<div className="info-form">
							<div className="form-group">
								<label>Tamanho do Calçado</label>
								<select 
									value={shoeSize || ''}
									onChange={(e) => {
										const value = parseInt(e.target.value);
										setShoeSize(value || undefined);
										if (value) {
											updateShoeSize(value);
										}
									}}
								>
									<option value="">Selecione o tamanho</option>
									<option value="32">32</option>
									<option value="33">33</option>
									<option value="34">34</option>
									<option value="35">35</option>
									<option value="36">36</option>
									<option value="37">37</option>
									<option value="38">38</option>
									<option value="39">39</option>
									<option value="40">40</option>
									<option value="41">41</option>
									<option value="42">42</option>
									<option value="43">43</option>
									<option value="44">44</option>
									<option value="45">45</option>
									<option value="46">46</option>
									<option value="47">47</option>
									<option value="48">48</option>
									<option value="49">49</option>
									<option value="50">50</option>
								</select>
							</div>
							<div className="form-group">
								<label>Observações</label>
								<textarea 
									placeholder="Observações adicionais"
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
								></textarea>
							</div>
							<div className="form-action">
								<button
									className="btn-next"
									onClick={() => goToStep(currentStep + 1)}
								>
									Avançar para Upload de Imagem
								</button>
							</div>
						</div>
					</div>
				)}

				{currentStep === 1 && (
					<div className="step-content">
						<h3>Upload de imagem do pé</h3>
						<div
							className="upload-area"
							onClick={triggerFileInput}
							onDragOver={(e) => {
								e.preventDefault();
								e.stopPropagation();
								e.currentTarget.classList.add("drag-over");
							}}
							onDragLeave={(e) => {
								e.preventDefault();
								e.stopPropagation();
								e.currentTarget.classList.remove("drag-over");
							}}
							onDrop={(e) => {
								e.preventDefault();
								e.stopPropagation();
								e.currentTarget.classList.remove("drag-over");
								handleImageUpload(e);
							}}
						>
							<input
								type="file"
								accept="image/*"
								ref={fileInputRef}
								onChange={handleImageUpload}
								style={{ display: "none" }}
							/>
							{currentModel.backgroundImage ? (
								<div className="image-preview">
									<img
										src={currentModel.backgroundImage}
										alt="Imagem do pé"
										style={{
											width: "100%",
											height: "100%",
											objectFit: "contain",
											maxHeight: "600px",
										}}
									/>
									<button
										className="btn-change-image"
										onClick={(e) => {
											e.stopPropagation();
											triggerFileInput();
										}}
									>
										Trocar imagem
									</button>
								</div>
							) : (
								<div className="upload-placeholder">
									<p>Arraste uma imagem ou clique para selecionar</p>
								</div>
							)}
						</div>
					</div>
				)}

				{currentStep === 2 && (
					<div className="step-content">
						<h3>Enquadramento da imagem</h3>
						<p className="instruction-text">
							<strong>ATENÇÃO:</strong> Apenas nesta etapa você pode mover e
							redimensionar a imagem de fundo. Arraste a imagem do pé para
							enquadrá-la corretamente. Use os botões de zoom para ajustar o
							tamanho. Uma vez finalizado o enquadramento, a imagem ficará fixa
							nas próximas etapas.
						</p>
						<div className="framing-area">
							{currentModel.backgroundImage ? (
								<div className="insole-image-container">
									<svg
										ref={svgRef}
										viewBox="0 0 300 700"
										className="insole-svg-container"
										onMouseDown={startDrag}
										onMouseMove={drag}
										onMouseUp={endDrag}
										onMouseLeave={endDrag}
									>
										{renderBackgroundImage()}
										<path
											id="insole-path"
											d={getInsolePath(currentModel?.footId || "left")}
											className="insole-svg"
											fill="none"
											stroke="#211915"
											strokeMiterlimit="10"
											strokeWidth="2"
											pointerEvents="none"
											transform="translate(150,280) scale(0.92,0.85) translate(-150,-320)"
										/>
									</svg>
									<Box sx={{ 
										position: 'absolute', 
										top: 16, 
										right: 16, 
										display: 'flex', 
										flexDirection: 'column', 
										gap: 1,
										zIndex: 10
									}}>
										<IconButton
											color="primary"
											onClick={() => handleZoomChange(1)}
											sx={{ 
												backgroundColor: 'white', 
												boxShadow: 2,
												'&:hover': { backgroundColor: 'primary.light', color: 'white' }
											}}
										>
											<Add />
										</IconButton>
										<IconButton
											color="primary"
											onClick={() => handleZoomChange(-1)}
											sx={{ 
												backgroundColor: 'white', 
												boxShadow: 2,
												'&:hover': { backgroundColor: 'primary.light', color: 'white' }
											}}
										>
											<Remove />
										</IconButton>
										<IconButton
											color="secondary"
											onClick={() => setBackgroundPosition({ x: 0, y: 0, scale: 1 })}
											sx={{ 
												backgroundColor: 'white', 
												boxShadow: 2,
												'&:hover': { backgroundColor: 'secondary.light', color: 'white' }
											}}
										>
											<Refresh />
										</IconButton>
									</Box>
								</div>
							) : (
								<div className="upload-placeholder">
									<p>
										Primeiro é necessário fazer o upload de uma imagem na etapa
										anterior.
									</p>
									<button
										className="btn-back"
										onClick={() => goToStep(currentStep - 1)}
									>
										Voltar para o upload
									</button>
								</div>
							)}
						</div>
					</div>
				)}

				{currentStep === 3 && (
					<div className="step-content">
						<h3>Definição de Guias</h3>
						<p className="instruction-text">
							<strong>ATENÇÃO:</strong> Apenas nesta etapa você pode mover as
							guias e o círculo de referência. Arraste as bolinhas coloridas
							para posicionar as guias horizontais (vermelhas) e vertical
							(azul). O círculo verde de 2,5 cm serve como referência de medida
							e pode ser movido agora, mas ficará fixo na próxima etapa.
						</p>
						<div className="guides-area">
							{currentModel.backgroundImage ? (
								<div className="insole-image-container">
									<svg
										ref={svgRef}
										viewBox="0 0 300 700"
										className="insole-svg-container"
										onMouseDown={startDrag}
										onMouseMove={drag}
										onMouseUp={endDrag}
										onMouseLeave={endDrag}
									>
										{renderBackgroundImage()}
										<path
											id="insole-path-guides"
											d={getInsolePath(currentModel?.footId || "left")}
											className="insole-svg"
											fill="none"
											stroke="#211915"
											strokeMiterlimit="10"
											strokeWidth="2"
											pointerEvents="none"
											transform="translate(150,280) scale(0.92,0.85) translate(-150,-320)"
										/>
										{guidePositions.map((guide) => (
											<React.Fragment key={guide.id}>
												<line
													id={guide.id}
													x1={guide.x1}
													y1={guide.y1}
													x2={guide.x2}
													y2={guide.y2}
													stroke={guide.id === "vertical" ? "blue" : "red"}
													strokeWidth="2"
													className="guide-line"
													pointerEvents="none"
												/>
												{/* Para linhas horizontais: duas bolas vermelhas */}
												{guide.id !== "vertical" && (
													<>
														<circle
															data-id={`handle-${guide.id}-start`}
															data-guide-id={guide.id}
															cx={guide.x1}
															cy={guide.y1}
															r="12"
															className="guide-handle draggable"
															fill="red"
															fillOpacity="0.7"
															style={{
																pointerEvents:
																	currentStep === 3 ? "all" : "none",
															}}
														/>
														<circle
															data-id={`handle-${guide.id}-end`}
															data-guide-id={guide.id}
															cx={guide.x2}
															cy={guide.y2}
															r="12"
															className="guide-handle draggable"
															fill="red"
															fillOpacity="0.7"
															style={{
																pointerEvents:
																	currentStep === 3 ? "all" : "none",
															}}
														/>
													</>
												)}
												{/* Para linha vertical: duas bolas azuis */}
												{guide.id === "vertical" && (
													<>
														<circle
															data-id={`handle-${guide.id}-start`}
															data-guide-id={guide.id}
															cx={guide.x1}
															cy={guide.y1}
															r="12"
															className="guide-handle draggable"
															fill="blue"
															fillOpacity="0.7"
															style={{
																pointerEvents:
																	currentStep === 3 ? "all" : "none",
															}}
														/>
														<circle
															data-id={`handle-${guide.id}-end`}
															data-guide-id={guide.id}
															cx={guide.x2}
															cy={guide.y2}
															r="12"
															className="guide-handle draggable"
															fill="blue"
															fillOpacity="0.7"
															style={{
																pointerEvents:
																	currentStep === 3 ? "all" : "none",
															}}
														/>
													</>
												)}
											</React.Fragment>
										))}
										<g
											style={{
												pointerEvents: currentStep === 3 ? "all" : "none",
											}}
										>
											<circle
												id="measureCircle"
												cx={150}
												cy={320}
												r={CIRCLE_REF_SIZE}
												stroke="green"
												strokeWidth="2"
												fill="rgba(0, 255, 0, 0.1)"
												className="draggable"
											/>
											<text
												x={150 - 15}
												y={320 + 5}
												fill="black"
												fontSize="12"
												fontWeight="bold"
												pointerEvents="none"
											>
												2,5 cm
											</text>
										</g>
									</svg>
								</div>
							) : (
								<div className="upload-placeholder">
									<p>Primeiro é necessário fazer o upload de uma imagem.</p>
									<button
										className="btn-back"
										onClick={() => goToStep(currentStep - 1)}
									>
										Ir para o upload
									</button>
								</div>
							)}
						</div>
					</div>
				)}

				{currentStep === 4 && (
					<div className="step-content">
						<h3>Seleção de Peças Podais</h3>
						<div className="pieces-editor">
							<div className="pieces-selection">
								{availablePieces.map((piece) => {
									const dimensions = pieceDimensions.get(piece.id);
									const isHovered = hoveredPieceMenu === piece.id;
									
									return (
										<div
											key={piece.id}
											className={`piece-item ${
												selectedPieces.includes(piece.id) ? "selected" : ""
											}`}
											onClick={() => togglePiece(piece.id)}
											onMouseEnter={() => setHoveredPieceMenu(piece.id)}
											onMouseLeave={() => setHoveredPieceMenu(null)}
											style={{ position: 'relative' }}
										>
											<img src={piece.image} alt={piece.name} />
											<span>{piece.name}</span>
											
											{/* Tooltip com dimensões */}
											{isHovered && (
												<div 
													className="piece-tooltip"
													style={{
														position: 'absolute',
														bottom: '100%',
														left: '50%',
														transform: 'translateX(-50%)',
														backgroundColor: 'rgba(0, 0, 0, 0.9)',
														color: 'white',
														padding: '8px 12px',
														borderRadius: '6px',
														fontSize: '12px',
														fontWeight: 'bold',
														whiteSpace: 'nowrap',
														zIndex: 1000,
														marginBottom: '5px',
														boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
													}}
												>
													{loadingDimensions ? (
														<div style={{ fontSize: '10px', opacity: 0.8 }}>
															Carregando dimensões...
														</div>
													) : dimensions ? (
														<>
															<div style={{ marginBottom: '2px' }}>
																{dimensions.thickness}mm × {dimensions.width}cm × {dimensions.depth}cm
															</div>
															<div style={{ fontSize: '10px', opacity: 0.8 }}>
																{dimensions.material || 'EVA'}
															</div>
														</>
													) : (
														<div style={{ fontSize: '10px', opacity: 0.8 }}>
															Dimensões não disponíveis
														</div>
													)}
												</div>
											)}
										</div>
									);
								})}
							</div>
							<div className="insole-preview">
								{currentModel.backgroundImage ? (
									<div className="insole-image-container">
										<svg
											ref={svgRef}
											viewBox="0 0 300 700"
											className="insole-svg-container"
											tabIndex={0}
											onMouseDown={startDrag}
											onMouseMove={drag}
											onMouseUp={endDrag}
											onMouseLeave={endDrag}
											onClick={handleBackgroundClick}
										>
											{renderBackgroundImage()}
											<path
												id="insole-path-pieces"
												d={getInsolePath(currentModel?.footId || "left")}
												className="insole-svg"
												fill="none"
												stroke="#211915"
												strokeMiterlimit="10"
												strokeWidth="2"
												pointerEvents="none"
												transform="translate(150,280) scale(0.92,0.85) translate(-150,-320)"
											/>
											{guidePositions.map((guide) => (
												<line
													key={guide.id}
													x1={guide.x1}
													y1={guide.y1}
													x2={guide.x2}
													y2={guide.y2}
													stroke={guide.id === "vertical" ? "blue" : "red"}
													strokeWidth="1"
													strokeDasharray="5,5"
													className="guide-line-reference"
													pointerEvents="none"
												/>
											))}
											<g pointerEvents="none">
												<circle
													cx={150}
													cy={320}
													r={CIRCLE_REF_SIZE}
													stroke="green"
													strokeWidth="2"
													fill="rgba(0, 255, 0, 0.1)"
												/>
												<text
													x={150 - 15}
													y={320 + 5}
													fill="black"
													fontSize="12"
													fontWeight="bold"
												>
													2,5 cm
												</text>
											</g>
											{piecePositions.map(renderPiece)}
										</svg>
										{activeAction === "resize" && (
											<div className="resize-instruction">
												Segure SHIFT para manter proporção
											</div>
										)}
									</div>
								) : (
									<div className="preview-placeholder">
										<p>
											Para usar o editor de peças, faça o upload de uma imagem.
										</p>
										<button className="btn-upload" onClick={() => goToStep(1)}>
											Fazer upload
										</button>
									</div>
								)}
							</div>
						</div>
						<Card sx={{ mt: 2, mb: 2 }}>
							<CardHeader
								avatar={<ListIcon color="primary" />}
								title="RELAÇÃO DE PEÇAS EM USO"
								titleTypographyProps={{ 
									variant: "h6", 
									fontWeight: "bold",
									color: "text.secondary"
								}}
							/>
							<CardContent>
								{selectedPieces.length > 0 ? (
									<List dense>
										{selectedPieces.map((pieceId) => {
											const piece = availablePieces.find((p) => p.id === pieceId);
											const dimensions = pieceDimensions.get(pieceId);
											return piece ? (
												<ListItem key={pieceId} sx={{ px: 0 }}>
													<ListItemIcon>
														<Extension color="primary" />
													</ListItemIcon>
													<ListItemText
														primary={piece.name}
														secondary={dimensions ? 
															`${dimensions.thickness}mm × ${dimensions.width}cm × ${dimensions.depth}cm` : 
															'Dimensões não disponíveis'
														}
													/>
													<Chip 
														label="Ativa" 
														color="success" 
														size="small"
														icon={<Done />}
													/>
												</ListItem>
											) : null;
										})}
									</List>
								) : (
									<Box sx={{ textAlign: 'center', py: 3 }}>
										<Info color="disabled" sx={{ fontSize: 48, mb: 1 }} />
										<Typography variant="body2" color="text.secondary">
											Nenhuma peça selecionada
										</Typography>
									</Box>
								)}
							</CardContent>
						</Card>
						<CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
							<Button
								variant="contained"
								color="warning"
								size="large"
								startIcon={<Print />}
								onClick={handlePrintInsole}
								sx={{ 
									minWidth: 200,
									fontWeight: 'bold',
									textTransform: 'none',
									borderRadius: 2
								}}
							>
								Imprimir Palmilha
							</Button>
							<Button
								variant="contained"
								color="success"
								size="large"
								startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
								onClick={handleSaveInsole}
								disabled={saving}
								sx={{ 
									minWidth: 200,
									fontWeight: 'bold',
									textTransform: 'none',
									borderRadius: 2
								}}
							>
								{saving ? "Salvando..." : "Salvar Modelo de Palmilha"}
							</Button>
						</CardActions>
					</div>
				)}
			</div>

			<Paper 
				elevation={3} 
				sx={{ 
					position: 'relative',
					bottom: 0, 
					left: 0, 
					right: 0, 
					p: 2, 
					zIndex: 1000,
					borderRadius: '16px 16px 0 0',
					background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
					mt: 4,
					boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
				}}
			>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, mx: 'auto' }}>
					<Button
						variant="outlined"
						size="large"
						startIcon={<ArrowBackIcon />}
						onClick={() => goToStep(currentStep - 1)}
						disabled={currentStep === 0}
						sx={{ 
							minWidth: 140,
							fontWeight: 'bold',
							textTransform: 'none',
							borderRadius: 2,
							borderColor: 'primary.main',
							color: 'primary.main',
							'&:hover': {
								borderColor: 'primary.dark',
								backgroundColor: 'primary.light',
								color: 'white'
							}
						}}
					>
						Anterior
					</Button>

					{currentStep < steps.length - 1 ? (
						<Button
							variant="contained"
							color="primary"
							size="large"
							endIcon={<ArrowForwardIcon />}
							onClick={() => goToStep(currentStep + 1)}
							sx={{ 
								minWidth: 140,
								fontWeight: 'bold',
								fontSize: '16px',
								textTransform: 'none',
								borderRadius: 2,
								boxShadow: 3
							}}
						>
							Próximo
						</Button>
					) : (
						<Box sx={{ display: 'flex', gap: 2 }}>
							<Button
								variant="contained"
								color="warning"
								size="large"
								startIcon={<Print />}
								onClick={handlePrintInsole}
								sx={{ 
									minWidth: 140,
									fontWeight: 'bold',
									fontSize: '16px',
									textTransform: 'none',
									borderRadius: 2,
									boxShadow: 3
								}}
							>
								Imprimir
							</Button>
							<Button
								variant="contained"
								color="success"
								size="large"
								startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
								onClick={handleSaveInsole}
								disabled={saving}
								sx={{ 
									minWidth: 180,
									fontWeight: 'bold',
									fontSize: '16px',
									textTransform: 'none',
									borderRadius: 2,
									boxShadow: 3
								}}
							>
								{saving ? "Salvando..." : "Finalizar e Salvar"}
							</Button>
						</Box>
					)}
				</Box>
			</Paper>
			</div>
		</Box>
	);
};

export default InsoleEditor;
