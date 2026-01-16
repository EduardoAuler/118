import React, { useState, useRef, useEffect, useMemo } from "react";
import {
	Box,
	Button,
	Typography,
	RadioGroup,
	FormControlLabel,
	Radio,
	Modal,
	IconButton,
	CircularProgress,
	Paper,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Divider,
	Checkbox,
	FormControl,
	MenuItem,
	Select,
} from "@mui/material";
import {
	CloudUpload,
	ZoomIn,
	ZoomOut,
	CenterFocusStrong,
	Close as CloseIcon,
	Save as SaveIcon,
	CameraAlt,
	Computer,
} from "@mui/icons-material";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { analyzePosture } from "../../services/openaiService";
import { saveImageWithPoints, generateImageWithPoints } from "../../services/imageStorageService";
import { GPTAnalysisResult, analyzePostureWithGPT } from "../../services/gptAnalysisService";
import GPTAnalysisResults from "./GPTAnalysisResults";
import QRCode from "react-qr-code";

// Imagens de placeholder
import frontImage from "../../assets/images/human-positions/front.jpg";
import transversoImage from "../../assets/images/human-positions/plano-transverso.png";
import posteriorImage from "../../assets/images/human-positions/posterior.jpg";
import backImage from "../../assets/images/human-positions/back.png";
import sagittalImage from "../../assets/images/human-positions/sagittal.jpg";
import topImage from "../../assets/images/human-positions/top.png";

// Imagens de arco plantar
// Pé esquerdo - plantigrafia
import esquerdoCavo1 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-esquerdo-cavo-1.png";
import esquerdoCavo2 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-esquerdo-cavo-2.png";
import esquerdoCavo3 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-esquerdo-cavo-3.png";
import esquerdoNeutro from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-esquerdo-n.png";
import esquerdoPlano1 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-esquerdo-plano-1.png";
import esquerdoPlano2 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-esquerdo-plano-2.png";
import esquerdoPlano3 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-esquerdo-plano-3.png";

// Pé direito - plantigrafia
import direitoCavo1 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-direito-cavo-1.png";
import direitoCavo2 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-direito-cavo-2.png";
import direitoCavo3 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-direito-cavo-3.png";
import direitoNeutro from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-direito-n.png";
import direitoPlano1 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-direito-plano-1.png";
import direitoPlano2 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-direito-plano-2.png";
import direitoPlano3 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-direito-plano-3.png";

// Arcos laterais
import lateralCavo from "../../assets/images/arco/arco-plantar-lateral-cavo.png";
import lateralNeutro from "../../assets/images/arco/arco-plantar-lateral-neutro.png";
import lateralPlano from "../../assets/images/arco/arco-plantar-lateral-plano.png";

interface PostureEvaluationProps {
	patientData: {
		frontalPhoto?: string;
		posteriorPhoto?: string;
		topPhoto?: string;
		sagittalPhoto?: string;
		inferiorPhoto?: string;
		scapula?: any;
		pelve?: any;
		// Dados do arco plantar
		footSize?: string;
		footwearType?: {
			sneakers?: boolean;
			shoes?: boolean;
		};
		insoleCharacteristics?: {
			hiTechComfort?: boolean;
			standard?: boolean;
			flexiGel?: boolean;
			podoTop?: boolean;
			podoPlus?: boolean;
			hiTechPosturology?: boolean;
			sports?: boolean;
			ecoSystem?: boolean;
		};
		leftArchType?: string;
		rightArchType?: string;
		leftArchSimple?: string;
		rightArchSimple?: string;
		[key: string]: any; // Index signature para permitir acesso dinâmico
	};
	onChange: (field: string, value: any) => void;
	consultationId?: string;
	patientId?: string;
}

interface BodyPoint {
	x: number;
	y: number;
	name: string;
	score: number;
	confidence: number;
}

const PostureEvaluation: React.FC<PostureEvaluationProps> = ({
	patientData,
	onChange,
	consultationId,
	patientId,
}) => {
	// Estados principais
	const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [currentPlane, setCurrentPlane] = useState<string>("");
	const [bodyPoints, setBodyPoints] = useState<BodyPoint[]>([]);
	const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
	const [analysisResult, setAnalysisResult] = useState<string | null>(null);

	// Estados para controle do canvas
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

	// Estados para upload de fotos
	const [showUploadDialog, setShowUploadDialog] = useState(false);
	const [showQRDialog, setShowQRDialog] = useState(false);
	const [currentPlaneForUpload, setCurrentPlaneForUpload] = useState<string>("");
	const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
	const [uploadSessionId, setUploadSessionId] = useState<string>("");
	const [processedImages, setProcessedImages] = useState<{[key: string]: string}>({});
	
	// Estados para análise GPT
	const [gptAnalysisResult, setGptAnalysisResult] = useState<GPTAnalysisResult | null>(null);
	const [isGptAnalyzing, setIsGptAnalyzing] = useState<boolean>(false);
	const [showGptAnalysis, setShowGptAnalysis] = useState<boolean>(false);

	// Refs
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);

	/**
	 * Inicialização do TensorFlow - SIMPLES E DIRETO
	 */
	useEffect(() => {
		const initializeTensorFlow = async () => {
			setIsLoading(true);
			try {
				console.log("🚀 Inicializando TensorFlow...");
				await tf.ready();
				
				const model = poseDetection.SupportedModels.MoveNet;
				const detectorConfig: poseDetection.MoveNetModelConfig = {
					modelType: "SinglePose.Thunder",
					enableSmoothing: true,
				};
				
				const detector = await poseDetection.createDetector(model, detectorConfig);
				setDetector(detector);
				console.log("✅ TensorFlow inicializado com sucesso!");
			} catch (error) {
				console.error("❌ Erro ao inicializar TensorFlow:", error);
			} finally {
				setIsLoading(false);
			}
		};

		initializeTensorFlow();
	}, []);

	/**
	 * Gerar ID único para sessão de upload
	 */
	const generateSessionId = () => {
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	};

	/**
	 * Gerar URL para QR code
	 */
	const generateQRCodeUrl = (planeId: string, sessionId: string) => {
		const baseUrl = window.location.origin;
		return `${baseUrl}/mobile-upload?plane=${planeId}&session=${sessionId}`;
	};

	/**
	 * Abrir diálogo de escolha de upload
	 */
	const handleUploadChoice = (planeId: string) => {
		setCurrentPlaneForUpload(planeId);
		setShowUploadDialog(true);
	};

	/**
	 * Escolher upload do computador
	 */
	const handleComputerUpload = () => {
		setShowUploadDialog(false);
		// Trigger file input
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = 'image/*';
		fileInput.onchange = (e) => handleFileUpload(currentPlaneForUpload)(e as any);
		fileInput.click();
	};

	/**
	 * Escolher upload via câmera do celular
	 */
	const handleMobileUpload = () => {
		setShowUploadDialog(false);
		const sessionId = generateSessionId();
		setUploadSessionId(sessionId);
		const qrUrl = generateQRCodeUrl(currentPlaneForUpload, sessionId);
		setQrCodeUrl(qrUrl);
		setShowQRDialog(true);
		
		// Iniciar polling para verificar se a foto foi enviada
		startPollingForUpload(sessionId);
	};

	/**
	 * Polling para verificar upload do celular
	 */
	const startPollingForUpload = (sessionId: string) => {
		const pollInterval = setInterval(async () => {
			try {
				// Aqui você implementaria a verificação real com seu backend
				// Por enquanto, vamos simular com localStorage
				const uploadedImage = localStorage.getItem(`upload_${sessionId}`);
				if (uploadedImage) {
					clearInterval(pollInterval);
					setShowQRDialog(false);
					handleImageData(uploadedImage, currentPlaneForUpload);
					localStorage.removeItem(`upload_${sessionId}`);
				}
			} catch (error) {
				console.error("Erro ao verificar upload:", error);
			}
		}, 2000); // Verificar a cada 2 segundos

		// Limpar polling após 5 minutos
		setTimeout(() => {
			clearInterval(pollInterval);
		}, 300000);
	};

	/**
	 * Processar dados da imagem (comum para ambos os métodos)
	 */
	const handleImageData = async (imageData: string, planeId: string) => {
		if (!detector) return;

		setIsProcessing(true);
		
		try {
			// Salvar imagem no estado local primeiro
			setProcessedImages(prev => ({
				...prev,
				[planeId]: imageData
			}));
			
			// Salvar imagem no patientData
			onChange(`${planeId}Photo`, imageData);
			setSelectedImage(imageData);
			setCurrentPlane(planeId);
			setIsModalOpen(true);

			console.log(`🔍 Processando ${planeId}...`);

			// Carregar imagem para detecção
			const image = new Image();
			image.src = imageData;
			await new Promise((resolve) => { image.onload = resolve; });

			console.log(`📐 Dimensões originais: ${image.width}x${image.height}`);

			// DETECÇÃO DIRETA - SEM COMPLICAÇÕES
			const poses = await detector.estimatePoses(image);
			
			if (poses.length > 0) {
				console.log(`🎯 Pose detectada com ${poses[0].keypoints.length} keypoints`);
				const points = processDetectedPose(poses[0], planeId, image);
				setBodyPoints(points);
				
				// Análise com IA
				setAnalysisResult("Analisando...");
				try {
					const result = await analyzePosture(points);
					setAnalysisResult(result || "Não foi possível analisar.");
				} catch (e) {
					setAnalysisResult("Erro ao analisar com IA.");
				}
			} else {
				console.log("⚠️ Nenhuma pose detectada");
				setBodyPoints([]);
			}
		} catch (error) {
			console.error("❌ Erro ao processar imagem:", error);
		} finally {
			setIsProcessing(false);
		}
	};

	/**
	 * Processamento de upload - DIRETO E PRECISO
	 */
	const handleFileUpload = (planeId: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files?.[0]) return;

		const file = e.target.files[0];
		
		try {
			// Converter arquivo para base64
			const imageData = await new Promise<string>((resolve) => {
				const reader = new FileReader();
				reader.onload = (event) => resolve(event.target!.result as string);
				reader.readAsDataURL(file);
			});

			await handleImageData(imageData, planeId);
		} catch (error) {
			console.error("❌ Erro ao processar arquivo:", error);
		}
	};

	/**
	 * Processamento da pose detectada - COORDENADAS ORIGINAIS
	 */
	const processDetectedPose = (pose: poseDetection.Pose, planeId: string, image: HTMLImageElement): BodyPoint[] => {
		const points: BodyPoint[] = [];
		
		// Filtrar keypoints com score adequado - threshold mais baixo para pés
		const validKeypoints = pose.keypoints.filter(kp => {
			if (!kp.name || !kp.score) return false;
			
			// Threshold mais baixo para tornozelos e pés
			if (kp.name.includes('ankle') || kp.name.includes('foot')) {
				return kp.score > 0.2;
			}
			
			return kp.score > 0.3;
		});

		console.log(`📍 Keypoints válidos: ${validKeypoints.length}`);
		console.log(`🦶 Keypoints dos tornozelos:`, validKeypoints.filter(kp => kp.name?.includes('ankle')));

		// Mapear pontos detectados - COORDENADAS ORIGINAIS DA IMAGEM
		validKeypoints.forEach(kp => {
			points.push({
				x: Math.round(kp.x), // Coordenada ORIGINAL
				y: Math.round(kp.y), // Coordenada ORIGINAL
				name: kp.name!,
				score: kp.score!,
				confidence: kp.score!,
			});
		});

		// Adicionar pontos anatômicos calculados
		const anatomicalPoints = calculateAnatomicalPoints(validKeypoints, planeId);
		points.push(...anatomicalPoints);

		// Adicionar pontos dos pés mesmo se não detectados diretamente
		const leftAnkle = validKeypoints.find(kp => kp.name === "left_ankle");
		const rightAnkle = validKeypoints.find(kp => kp.name === "right_ankle");
		
		if (!leftAnkle && planeId === "posterior") {
			// Estimar posição do tornozelo esquerdo baseado no joelho
			const leftKnee = validKeypoints.find(kp => kp.name === "left_knee");
			if (leftKnee) {
				points.push({
					x: Math.round(leftKnee.x),
					y: Math.round(leftKnee.y + 80), // Estimar posição do tornozelo
					name: "left_ankle_estimated",
					score: 0.5,
					confidence: 0.5,
				});
			}
		}
		
		if (!rightAnkle && planeId === "posterior") {
			// Estimar posição do tornozelo direito baseado no joelho
			const rightKnee = validKeypoints.find(kp => kp.name === "right_knee");
			if (rightKnee) {
				points.push({
					x: Math.round(rightKnee.x),
					y: Math.round(rightKnee.y + 80), // Estimar posição do tornozelo
					name: "right_ankle_estimated",
					score: 0.5,
					confidence: 0.5,
				});
			}
		}

		console.log(`🎯 Total de pontos em coordenadas ORIGINAIS: ${points.length}`);
		console.log(`🦶 Pontos dos tornozelos incluídos:`, points.filter(p => p.name.includes('ankle')));
		return points;
	};

	/**
	 * Cálculo de pontos anatômicos - SIMPLES E PRECISO
	 */
	const calculateAnatomicalPoints = (keypoints: poseDetection.Keypoint[], planeId: string): BodyPoint[] => {
		const points: BodyPoint[] = [];
		
		const nose = keypoints.find(kp => kp.name === "nose");
		const leftShoulder = keypoints.find(kp => kp.name === "left_shoulder");
		const rightShoulder = keypoints.find(kp => kp.name === "right_shoulder");
		const leftHip = keypoints.find(kp => kp.name === "left_hip");
		const rightHip = keypoints.find(kp => kp.name === "right_hip");
		const leftKnee = keypoints.find(kp => kp.name === "left_knee");
		const rightKnee = keypoints.find(kp => kp.name === "right_knee");
		const leftAnkle = keypoints.find(kp => kp.name === "left_ankle");
		const rightAnkle = keypoints.find(kp => kp.name === "right_ankle");

		// Ponto cervical (C7)
		if (nose) {
			points.push({
				x: Math.round(nose.x),
				y: Math.round(nose.y - 30),
				name: "cervical",
				score: 1,
				confidence: 1,
			});
		}

		// Centro dos ombros
		if (leftShoulder && rightShoulder) {
			points.push({
				x: Math.round((leftShoulder.x + rightShoulder.x) / 2),
				y: Math.round((leftShoulder.y + rightShoulder.y) / 2),
				name: "shoulder_center",
				score: 1,
				confidence: 1,
			});
		}

		// Centro dos quadris
		if (leftHip && rightHip) {
			points.push({
				x: Math.round((leftHip.x + rightHip.x) / 2),
				y: Math.round((leftHip.y + rightHip.y) / 2),
				name: "hip_center",
				score: 1,
				confidence: 1,
			});
		}

		// Pontos dos pés - apenas tornozelos
		const leftAnklePoint = leftAnkle || keypoints.find(kp => kp.name === "left_ankle_estimated");
		const rightAnklePoint = rightAnkle || keypoints.find(kp => kp.name === "right_ankle_estimated");
		
		// Adicionar apenas os tornozelos detectados ou estimados
		if (leftAnklePoint) {
			points.push({
				x: Math.round(leftAnklePoint.x),
				y: Math.round(leftAnklePoint.y),
				name: "left_ankle",
				score: leftAnklePoint.score || 1,
				confidence: leftAnklePoint.score || 1,
			});
		}

		if (rightAnklePoint) {
			points.push({
				x: Math.round(rightAnklePoint.x),
				y: Math.round(rightAnklePoint.y),
				name: "right_ankle",
				score: rightAnklePoint.score || 1,
				confidence: rightAnklePoint.score || 1,
			});
		}

		// Pontos específicos para vista posterior
		if (planeId === "posterior" && leftShoulder && rightShoulder) {
			points.push(
				{
					x: Math.round(leftShoulder.x + 20),
					y: Math.round(leftShoulder.y - 20),
					name: "left_clavicle",
					score: 1,
					confidence: 1,
				},
				{
					x: Math.round(rightShoulder.x - 20),
					y: Math.round(rightShoulder.y - 20),
					name: "right_clavicle",
					score: 1,
					confidence: 1,
				}
			);
		}

		// Pontos específicos para vista frontal - alinhamento dos tornozelos
		if (planeId === "frontal" && leftAnkle && rightAnkle) {
			// Linha de alinhamento entre os tornozelos será desenhada pelas conexões
		}

		return points;
	};

	/**
	 * Controle de zoom com mouse wheel - COORDENADAS ORIGINAIS
	 */
	const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
		e.preventDefault();
		if (!canvasRef.current || !imageRef.current) return;

		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		// Calcular dimensões da imagem no canvas
		const { drawWidth, drawHeight, offsetX, offsetY } = getImageDimensions();

		// Ponto do mouse em relação à imagem ORIGINAL
		const imageX = (mouseX - offsetX - pan.x) / zoom;
		const imageY = (mouseY - offsetY - pan.y) / zoom;

		// Novo zoom
		const delta = e.deltaY > 0 ? 0.9 : 1.1;
		const newZoom = Math.max(0.2, Math.min(10, zoom * delta));

		// Novo pan para manter o ponto do mouse fixo
		const newPan = {
			x: mouseX - (imageX * newZoom + offsetX),
			y: mouseY - (imageY * newZoom + offsetY),
		};

		setZoom(newZoom);
		setPan(newPan);
	};

	/**
	 * Clique no canvas - SELEÇÃO DE PONTOS COM COORDENADAS ORIGINAIS
	 */
	const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (!canvasRef.current || !imageRef.current) return;

		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		// Modo pan com Shift
		if (e.shiftKey) {
			setIsDragging(true);
			setDragStart({ x, y });
			return;
		}

		// Converter para coordenadas da imagem ORIGINAL
		const { drawWidth, drawHeight, offsetX, offsetY } = getImageDimensions();
		const imageWidth = imageRef.current.width;
		const imageHeight = imageRef.current.height;

		const imageX = ((x - offsetX - pan.x) / zoom) * (imageWidth / (drawWidth / zoom));
		const imageY = ((y - offsetY - pan.y) / zoom) * (imageHeight / (drawHeight / zoom));

		// Encontrar ponto mais próximo
		const clickedPointIndex = bodyPoints.findIndex((point) => {
			const distance = Math.sqrt(
				Math.pow(point.x - imageX, 2) + Math.pow(point.y - imageY, 2)
			);
			return distance < 30 / zoom;
		});

		setSelectedPoint(clickedPointIndex !== -1 ? clickedPointIndex : null);
	};

	/**
	 * Movimento do mouse - ARRASTAR PONTOS COM COORDENADAS ORIGINAIS
	 */
	const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (!canvasRef.current || !imageRef.current) return;

		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		// Pan da visualização
		if (isDragging) {
			const deltaX = x - dragStart.x;
			const deltaY = y - dragStart.y;
			setPan(prev => ({
				x: prev.x + deltaX,
				y: prev.y + deltaY,
			}));
			setDragStart({ x, y });
			return;
		}

		// Arrastar ponto selecionado
		if (selectedPoint !== null) {
			const { drawWidth, drawHeight, offsetX, offsetY } = getImageDimensions();
			const imageWidth = imageRef.current.width;
			const imageHeight = imageRef.current.height;

			// Converter para coordenadas da imagem ORIGINAL
			const imageX = ((x - offsetX - pan.x) / zoom) * (imageWidth / (drawWidth / zoom));
			const imageY = ((y - offsetY - pan.y) / zoom) * (imageHeight / (drawHeight / zoom));

			const newPoints = [...bodyPoints];
			newPoints[selectedPoint] = {
				...newPoints[selectedPoint],
				x: Math.round(imageX), // Coordenada ORIGINAL
				y: Math.round(imageY), // Coordenada ORIGINAL
			};
			setBodyPoints(newPoints);
		}
	};

	/**
	 * Soltar mouse
	 */
	const handleMouseUp = () => {
		setSelectedPoint(null);
		setIsDragging(false);
	};

	/**
	 * Resetar zoom e pan
	 */
	const resetZoom = () => {
		setZoom(1);
		setPan({ x: 0, y: 0 });
	};

	/**
	 * Calcular dimensões da imagem no canvas
	 */
	const getImageDimensions = () => {
		if (!canvasRef.current || !imageRef.current) {
			return { drawWidth: 0, drawHeight: 0, offsetX: 0, offsetY: 0 };
		}

		const canvas = canvasRef.current;
		const containerWidth = canvas.clientWidth;
		const containerHeight = canvas.clientHeight;
		const imageWidth = imageRef.current.width;
		const imageHeight = imageRef.current.height;
		const imageRatio = imageWidth / imageHeight;
		const containerRatio = containerWidth / containerHeight;

		let drawWidth = containerWidth;
		let drawHeight = containerHeight;
		let offsetX = 0;
		let offsetY = 0;

		if (imageRatio > containerRatio) {
			drawHeight = drawWidth / imageRatio;
			offsetY = (containerHeight - drawHeight) / 2;
		} else {
			drawWidth = drawHeight * imageRatio;
			offsetX = (containerWidth - drawWidth) / 2;
		}

		return { drawWidth, drawHeight, offsetX, offsetY };
	};

	/**
	 * Desenhar no canvas - COORDENADAS ORIGINAIS
	 */
	const drawCanvas = () => {
		if (!canvasRef.current || !imageRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Limpar canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Configurar dimensões do canvas
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;

		const { drawWidth, drawHeight, offsetX, offsetY } = getImageDimensions();
		const imageWidth = imageRef.current.width;
		const imageHeight = imageRef.current.height;

		// Aplicar transformações
		ctx.save();
		ctx.translate(offsetX + pan.x, offsetY + pan.y);
		ctx.scale(zoom, zoom);

		// Desenhar imagem
		ctx.drawImage(imageRef.current, 0, 0, drawWidth / zoom, drawHeight / zoom);

		// Desenhar conexões
		const connections = getConnections();
		connections.forEach(([point1Name, point2Name]) => {
			const point1 = bodyPoints.find(p => p.name === point1Name);
			const point2 = bodyPoints.find(p => p.name === point2Name);

			if (point1 && point2) {
				// Converter coordenadas ORIGINAIS para canvas
				const x1 = point1.x * (drawWidth / zoom / imageWidth);
				const y1 = point1.y * (drawHeight / zoom / imageHeight);
				const x2 = point2.x * (drawWidth / zoom / imageWidth);
				const y2 = point2.y * (drawHeight / zoom / imageHeight);

				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.strokeStyle = "#00ff00";
				ctx.lineWidth = 2 / zoom;
				ctx.stroke();
			}
		});

		// Desenhar pontos
		bodyPoints.forEach((point, index) => {
			// Converter coordenadas ORIGINAIS para canvas
			const x = point.x * (drawWidth / zoom / imageWidth);
			const y = point.y * (drawHeight / zoom / imageHeight);

			// Desenhar ponto
			ctx.beginPath();
			ctx.arc(x, y, 6 / zoom, 0, 2 * Math.PI);
			ctx.fillStyle = selectedPoint === index ? "#ff0000" : "#00ff00";
			ctx.fill();
			ctx.strokeStyle = "#000000";
			ctx.lineWidth = 2 / zoom;
			ctx.stroke();

			// Desenhar label
			if (point.name) {
				ctx.fillStyle = "#ffffff";
				ctx.font = `bold ${12 / zoom}px Arial`;
				
				// Fundo do texto
				const textWidth = ctx.measureText(point.name).width;
				ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
				ctx.fillRect(x + 8/zoom, y - 22/zoom, textWidth + 4/zoom, 16/zoom);
				
				// Texto
				ctx.fillStyle = "#ffffff";
				ctx.fillText(point.name, x + 10/zoom, y - 10/zoom);

				// Mostrar coordenadas no ponto selecionado
				if (selectedPoint === index) {
					const coordText = `(${point.x}, ${point.y})`;
					const coordWidth = ctx.measureText(coordText).width;
					
					ctx.fillStyle = "rgba(255, 255, 0, 0.9)";
					ctx.fillRect(x + 8/zoom, y - 38/zoom, coordWidth + 4/zoom, 14/zoom);
					
					ctx.fillStyle = "#000000";
					ctx.font = `${10 / zoom}px Arial`;
					ctx.fillText(coordText, x + 10/zoom, y - 28/zoom);
				}
			}
		});

		ctx.restore();
	};

	/**
	 * Definir conexões entre pontos
	 */
	const getConnections = (): [string, string][] => {
		const base: [string, string][] = [
			["left_shoulder", "right_shoulder"],
			["left_shoulder", "left_elbow"],
			["left_elbow", "left_wrist"],
			["right_shoulder", "right_elbow"],
			["right_elbow", "right_wrist"],
			["left_hip", "right_hip"],
			["left_hip", "left_knee"],
			["left_knee", "left_ankle"],
			["right_hip", "right_knee"],
			["right_knee", "right_ankle"],
			["nose", "cervical"],
			["shoulder_center", "hip_center"],
		];

		// Conexões dos pés - apenas tornozelos
		const footConnections: [string, string][] = [
			["left_ankle", "left_ankle_estimated"],
			["right_ankle", "right_ankle_estimated"],
		];

		// Conexões específicas para vista posterior
		if (currentPlane === "posterior") {
			base.push(
				["left_shoulder", "left_clavicle"],
				["right_shoulder", "right_clavicle"]
			);
		}

		// Conexões específicas para vista frontal - alinhamento dos tornozelos
		if (currentPlane === "frontal") {
			base.push(
				["left_ankle", "right_ankle"],
				["left_ankle_estimated", "right_ankle_estimated"]
			);
		}

		return [...base, ...footConnections];
	};

	/**
	 * Redesenhar quando necessário
	 */
	useEffect(() => {
		drawCanvas();
	}, [zoom, pan, bodyPoints, selectedPoint]);

	/**
	 * Carregar imagens processadas ao montar o componente
	 */
	useEffect(() => {
		const loadProcessedImages = () => {
			const images: {[key: string]: string} = {};
			
			console.log("🔄 Carregando imagens processadas...");
			console.log("📸 patientData:", patientData);
			
			if (patientData.frontalPhoto && patientData.frontalPhoto.includes('data:image')) {
				images.frontal = patientData.frontalPhoto;
				console.log("✅ Imagem frontal carregada");
			}
			if (patientData.posteriorPhoto && patientData.posteriorPhoto.includes('data:image')) {
				images.posterior = patientData.posteriorPhoto;
				console.log("✅ Imagem posterior carregada");
			}
			if (patientData.inferiorPhoto && patientData.inferiorPhoto.includes('data:image')) {
				images.inferior = patientData.inferiorPhoto;
				console.log("✅ Imagem inferior carregada");
			}
			if (patientData.sagittalPhoto && patientData.sagittalPhoto.includes('data:image')) {
				images.sagittal = patientData.sagittalPhoto;
				console.log("✅ Imagem sagital carregada");
			}
			if (patientData.topPhoto && patientData.topPhoto.includes('data:image')) {
				images.top = patientData.topPhoto;
				console.log("✅ Imagem top carregada");
			}
			
			console.log("📸 Estado final das imagens:", images);
			
			// SÓ atualizar se não houver imagens já processadas
			setProcessedImages(prev => {
				if (Object.keys(prev).length === 0) {
					console.log("📸 Primeira vez - carregando imagens do patientData");
					return images;
				} else {
					console.log("📸 Mantendo imagens já processadas:", prev);
					return prev;
				}
			});
		};
		
		loadProcessedImages();
	}, [patientData]);

	/**
	 * Monitorar mudanças no processedImages para debug
	 */
	useEffect(() => {
		console.log("🔄 processedImages mudou:", processedImages);
		
		// Verificar se alguma imagem foi perdida
		if (Object.keys(processedImages).length === 0 && Object.keys(patientData).some(key => key.includes('Photo') && patientData[key])) {
			console.log("⚠️ ALERTA: processedImages foi resetado mas patientData tem fotos!");
			
			// Restaurar imagens perdidas
			const restoreImages: {[key: string]: string} = {};
			if (patientData.frontalPhoto && patientData.frontalPhoto.includes('data:image')) {
				restoreImages.frontal = patientData.frontalPhoto;
			}
			if (patientData.posteriorPhoto && patientData.posteriorPhoto.includes('data:image')) {
				restoreImages.posterior = patientData.posteriorPhoto;
			}
			if (patientData.inferiorPhoto && patientData.inferiorPhoto.includes('data:image')) {
				restoreImages.inferior = patientData.inferiorPhoto;
			}
			if (patientData.sagittalPhoto && patientData.sagittalPhoto.includes('data:image')) {
				restoreImages.sagittal = patientData.sagittalPhoto;
			}
			if (patientData.topPhoto && patientData.topPhoto.includes('data:image')) {
				restoreImages.top = patientData.topPhoto;
			}
			
			if (Object.keys(restoreImages).length > 0) {
				console.log("🔄 Restaurando imagens perdidas:", restoreImages);
				setProcessedImages(restoreImages);
			}
		}
	}, [processedImages, patientData]);

	/**
	 * Salvar pontos e analisar
	 */
	const handleSavePoints = async () => {
		setIsModalOpen(false);
		setAnalysisResult("Analisando...");
		
		try {
			// Gerar imagem com pontos desenhados
			if (selectedImage && currentPlane) {
				console.log(`💾 Salvando pontos para ${currentPlane}...`);
				
				// Gerar imagem com pontos usando o serviço
				const imageWithPoints = await generateImageWithPoints(
					selectedImage,
					bodyPoints,
					getConnections()
				);

				console.log(`✅ Imagem com pontos gerada para ${currentPlane}`);

				// Salvar no Storage se tiver consultationId e patientId
				if (consultationId && patientId) {
					try {
						const storageUrl = await saveImageWithPoints(
							imageWithPoints,
							patientId,
							currentPlane,
							consultationId
						);
						
						// Salvar URL no patientData
						onChange(`${currentPlane}PhotoUrl`, storageUrl);
						console.log(`🌐 URL do Storage salva: ${storageUrl}`);
					} catch (storageError) {
						console.error("❌ Erro ao salvar no Storage:", storageError);
						// Continuar mesmo se falhar o Storage
					}
				}

				// Salvar a imagem com pontos no estado local PRIMEIRO
				setProcessedImages(prev => {
					const newState = {
						...prev,
						[currentPlane]: imageWithPoints
					};
					console.log(`📸 Estado atualizado:`, newState);
					return newState;
				});

				// Salvar a imagem com pontos no patientData
				onChange(`${currentPlane}Photo`, imageWithPoints);
				
				console.log(`💾 Imagem salva no patientData para ${currentPlane}`);
				
				// Forçar re-render para mostrar a nova imagem
				setTimeout(() => {
					console.log(`🔄 Forçando re-render para ${currentPlane}`);
				}, 100);
			}

			const result = await analyzePosture(bodyPoints);
			setAnalysisResult(result || "Não foi possível analisar.");
		} catch (e) {
			console.error("❌ Erro ao salvar pontos:", e);
			setAnalysisResult("Erro ao analisar com IA.");
		}
	};

	/**
	 * Executar análise completa com GPT Vision
	 */
	const handleGPTAnalysis = async () => {
		setIsGptAnalyzing(true);
		setShowGptAnalysis(true);
		
		try {
			console.log("🤖 Iniciando análise GPT Vision...");
			console.log("📸 Imagens processadas disponíveis:", Object.keys(processedImages));
			
			// Usar imagens do estado local (processedImages) em vez do patientData
			// para evitar problemas com imagens grandes no Firestore
			const imagesWithSkeleton = Object.entries(processedImages)
				.filter(([key, imageData]) => imageData && imageData.includes('data:image'))
				.map(([planeId, imageData]) => ({
					planeId,
					imageData,
					description: getPlaneDescription(planeId)
				}));
			
			console.log(`📸 Encontradas ${imagesWithSkeleton.length} imagens com esqueleto para análise`);
			
			if (imagesWithSkeleton.length === 0) {
				throw new Error("Nenhuma imagem com esqueleto encontrada. Faça upload e detecte pontos corporais primeiro.");
			}
			
			// Criar patientData temporário apenas com URLs (não as imagens grandes)
			const patientDataForAnalysis = {
				...patientData,
				// Remover imagens grandes do patientData para evitar erro do Firestore
				frontalPhoto: undefined,
				posteriorPhoto: undefined,
				sagittalPhoto: undefined,
				inferiorPhoto: undefined,
				topPhoto: undefined
			};
			
			const result = await analyzePostureWithGPT(imagesWithSkeleton, patientDataForAnalysis);
			setGptAnalysisResult(result);
			console.log("✅ Análise GPT concluída:", result);
		} catch (error) {
			console.error("❌ Erro na análise GPT:", error);
			setAnalysisResult("Erro ao analisar com GPT Vision. Verifique se há imagens com esqueleto disponíveis.");
		} finally {
			setIsGptAnalyzing(false);
		}
	};

	/**
	 * Obter descrição do plano
	 */
	const getPlaneDescription = (planeId: string): string => {
		const descriptions: { [key: string]: string } = {
			frontal: 'Vista Frontal - Anterior',
			posterior: 'Vista Posterior - Posterior', 
			sagittal: 'Vista Sagital - Lateral',
			inferior: 'Vista Inferior - Plantar',
			top: 'Vista Superior - Transversal'
		};
		return descriptions[planeId] || planeId;
	};

	/**
	 * Handlers para dados do arco plantar
	 */
	const handleSelectChange = (e: any) => {
		const { name, value } = e.target;
		onChange(name, value);
	};

	const handleCheckboxChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		category: string
	) => {
		const { name, checked } = e.target;
		onChange(category, {
			...patientData[category],
			[name]: checked,
		});
	};

	const handleRadioChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		name: string
	) => {
		onChange(name, e.target.value);
	};

	// Configuração dos planos - usando useMemo para evitar recriação desnecessária
	const planes = useMemo(() => {
		const planesConfig = [
			{ id: "frontal", title: "Plano Frontal", placeholder: frontImage, photo: processedImages.frontal || patientData.frontalPhoto },
			{ id: "posterior", title: "Plano Posterior", placeholder: backImage, photo: processedImages.posterior || patientData.posteriorPhoto },
			{ id: "inferior", title: "Plano Inferior", placeholder: posteriorImage, photo: processedImages.inferior || patientData.inferiorPhoto },
			{ id: "sagittal", title: "Plano Sagital", placeholder: sagittalImage, photo: processedImages.sagittal || patientData.sagittalPhoto },
			{ id: "top", title: "Plano de Topo", placeholder: topImage, photo: processedImages.top || patientData.topPhoto },
		];

		// Debug: mostrar o que está sendo usado para cada plano
		console.log("🔍 Configuração dos planos:");
		planesConfig.forEach(plane => {
			console.log(`${plane.id}:`, {
				processedImage: processedImages[plane.id] ? 'Sim' : 'Não',
				patientDataImage: patientData[`${plane.id}Photo`] ? 'Sim' : 'Não',
				finalPhoto: plane.photo ? 'Sim' : 'Não'
			});
		});

		return planesConfig;
	}, [processedImages]); // Só recriar quando processedImages mudar

	// Função para obter o título do plano atual
	const getCurrentPlaneTitle = () => {
		const plane = planes.find(p => p.id === currentPlaneForUpload);
		return plane ? plane.title : "Plano";
	};

	return (
		<Box className="form-section">
			<Typography variant="h6" className="form-section-title">
				AVALIAÇÃO POSTUROLÓGICA
			</Typography>

			{/* Debug das imagens processadas */}
			<Box mt={2} mb={2}>
				<Paper sx={{ p: 2, bgcolor: "#fff3cd", border: "1px solid #ffeaa7", borderRadius: 2 }}>
					<Typography variant="h6" fontWeight="bold" color="warning.main" mb={1}>
						🔍 Debug - Estado das Imagens
					</Typography>
					<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
						<strong>Processed Images:</strong> {Object.keys(processedImages).length} imagens
					</Typography>
					<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
						<strong>Current Plane:</strong> {currentPlane || 'Nenhum'}
					</Typography>
					<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
						<strong>Selected Image:</strong> {selectedImage ? 'Sim' : 'Não'}
					</Typography>
					<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
						<strong>Body Points:</strong> {bodyPoints.length} pontos
					</Typography>
					<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'red' }}>
						<strong>Posterior Photo:</strong> {patientData.posteriorPhoto ? 'Sim' : 'Não'}
					</Typography>
				</Paper>
			</Box>

			{/* Resultado da IA */}
			{analysisResult && (
				<Box mt={2}>
					<Paper sx={{ p: 2, bgcolor: "#f8f9fa", border: "1px solid #e9ecef", borderRadius: 2 }}>
						<Typography variant="h6" fontWeight="bold" color="primary" mb={1}>
							Parecer da IA
						</Typography>
						<Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
							{analysisResult}
						</Typography>
					</Paper>
				</Box>
			)}

			{/* Botão para análise GPT */}
			<Box mt={3} mb={2}>
				<Button
					variant="contained"
					color="secondary"
					size="large"
					onClick={handleGPTAnalysis}
					disabled={isGptAnalyzing}
					sx={{ 
						fontWeight: 'bold',
						px: 4,
						py: 1.5,
						fontSize: '1.1rem'
					}}
				>
					{isGptAnalyzing ? (
						<>
							<CircularProgress size={20} sx={{ mr: 1 }} />
							Analisando com GPT Vision...
						</>
					) : (
						<>
							🤖 Análise Avançada com GPT Vision
						</>
					)}
				</Button>
				<Typography variant="caption" color="text.secondary" display="block" mt={1}>
					Análise completa das imagens com esqueleto usando IA avançada
				</Typography>
			</Box>

			{/* Resultados da análise GPT */}
			{showGptAnalysis && (
				<Box mt={3}>
					<GPTAnalysisResults
						analysisResult={gptAnalysisResult}
						isLoading={isGptAnalyzing}
						onRefresh={handleGPTAnalysis}
						patientName={patientData.name || 'Paciente'}
					/>
				</Box>
			)}

			{/* Planos posturais */}
			<Box display="flex" flexWrap="wrap" gap={3} justifyContent="space-between">
				{planes.map((plane) => (
					<Box key={plane.id} className="postural-view" flex={1} minWidth={300}>
						<Typography variant="subtitle1" fontWeight="bold" align="center" marginBottom={1}>
							{plane.title}
						</Typography>
						<Box className={`image-preview ${plane.photo ? "has-image" : ""}`}>
							{plane.photo ? (
								<Box sx={{ position: 'relative' }}>
									<img 
										src={plane.photo} 
										alt={plane.title} 
										style={{
											width: "100%",
											height: "100%",
											objectFit: "contain"
										}}
									/>
									{processedImages[plane.id] && (
										<Box
											sx={{
												position: 'absolute',
												top: 8,
												right: 8,
												bgcolor: 'rgba(0, 255, 0, 0.9)',
												color: 'white',
												padding: '4px 8px',
												borderRadius: '12px',
												fontSize: '0.75rem',
												fontWeight: 'bold',
												display: 'flex',
												alignItems: 'center',
												gap: 0.5,
											}}
										>
											🎯 Pontos Detectados
										</Box>
									)}
								</Box>
							) : (
								<Box sx={{ width: "100%", height: "100%", position: "relative" }}>
									<img
										src={plane.placeholder}
										alt={`${plane.title} Placeholder`}
										style={{
											width: "100%",
											height: "100%",
											objectFit: "contain",
											opacity: 0.7,
										}}
									/>
									<Box
										sx={{
											position: "absolute",
											top: 0,
											left: 0,
											width: "100%",
											height: "100%",
											display: "flex",
											flexDirection: "column",
											justifyContent: "center",
											alignItems: "center",
											backgroundColor: "rgba(255,255,255,0.5)",
										}}
									>
										<CloudUpload className="upload-icon" />
										<Typography className="upload-text">
											Clique para carregar uma imagem do {plane.title.toLowerCase()}
										</Typography>
										<Button
											variant="contained"
											className="upload-button"
											onClick={() => handleUploadChoice(plane.id)}
										>
											Enviar a foto
										</Button>
									</Box>
								</Box>
							)}
						</Box>
						{plane.photo && (
							<Button
								variant="contained"
								className="upload-button"
								sx={{ marginTop: 1, width: "100%" }}
								onClick={() => handleUploadChoice(plane.id)}
							>
								Enviar a foto
							</Button>
						)}
					</Box>
				))}
			</Box>

			{/* Seção Transverso */}
			<Box marginTop={4}>
				<Typography
					variant="subtitle1"
					fontWeight="bold"
					bgcolor="#20639b"
					color="white"
					padding={1}
				>
					PLANO TRANSVERSO | Vista Superior
				</Typography>

				<Box display="flex" justifyContent="center" marginTop={2}>
					<img src={transversoImage} alt="Plano Transverso" width={150} />
				</Box>

				<Box className="form-row">
					<Box className="form-field full-width">
						<Typography variant="subtitle1" fontWeight="bold">
							Escápula Posterior
						</Typography>
						<RadioGroup
							row
							name="scapula"
							value={patientData.scapula}
							onChange={(e) => onChange("scapula", e.target.value)}
						>
							<FormControlLabel value="esquerdo" control={<Radio />} label="E" />
							<FormControlLabel value="direito" control={<Radio />} label="D" />
							<FormControlLabel value="alinhado" control={<Radio />} label="Alinhado" />
						</RadioGroup>
					</Box>
				</Box>

				<Box className="form-row">
					<Box className="form-field full-width">
						<Typography variant="subtitle1" fontWeight="bold">
							Pelve Anterior
						</Typography>
						<RadioGroup
							row
							name="pelve"
							value={patientData.pelve}
							onChange={(e) => onChange("pelve", e.target.value)}
						>
							<FormControlLabel value="esquerdo" control={<Radio />} label="E" />
							<FormControlLabel value="direito" control={<Radio />} label="D" />
							<FormControlLabel value="alinhado" control={<Radio />} label="Alinhado" />
						</RadioGroup>
					</Box>
				</Box>
			</Box>

			{/* Modal de edição */}
			<Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<Paper
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						width: "90%",
						height: "90%",
						bgcolor: "background.paper",
						boxShadow: 24,
						p: 4,
						display: "flex",
						flexDirection: "column",
						gap: 2,
						overflow: "hidden",
					}}
				>
					{/* Header */}
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<Typography variant="h6">
							Ajuste dos Pontos Corporais - {currentPlane}
						</Typography>
						<IconButton onClick={() => setIsModalOpen(false)}>
							<CloseIcon />
						</IconButton>
					</Box>

					{/* Conteúdo principal */}
					<Box sx={{ flex: 1, display: "flex", gap: 2, overflow: "hidden" }}>
						{/* Canvas */}
						<Box sx={{ flex: 2, position: "relative", bgcolor: "#f5f5f5", borderRadius: 1 }}>
							{isProcessing ? (
								<Box
									sx={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
										height: "100%",
										gap: 2,
									}}
								>
									<CircularProgress size={60} />
									<Typography variant="h6" fontWeight="bold">
										Detectando pontos corporais...
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Processando com máxima precisão
									</Typography>
								</Box>
							) : (
								selectedImage && (
									<>
										<img
											ref={imageRef}
											src={selectedImage}
											alt="Preview"
											style={{ display: "none" }}
											onLoad={drawCanvas}
										/>
										<canvas
											ref={canvasRef}
											style={{
												width: "100%",
												height: "100%",
												cursor: isDragging
													? "grabbing"
													: selectedPoint !== null
													? "crosshair"
													: "grab",
												borderRadius: "4px",
											}}
											onMouseDown={handleMouseDown}
											onMouseMove={handleMouseMove}
											onMouseUp={handleMouseUp}
											onMouseLeave={handleMouseUp}
											onWheel={handleWheel}
										/>

										{/* Controles de zoom */}
										<Box
											sx={{
												position: "absolute",
												bottom: 16,
												right: 16,
												display: "flex",
												flexDirection: "column",
												gap: 1,
												bgcolor: "rgba(255, 255, 255, 0.95)",
												padding: 1,
												borderRadius: 1,
												boxShadow: 3,
											}}
										>
											<IconButton
												size="small"
												onClick={() => setZoom(z => Math.min(z * 1.2, 10))}
												disabled={zoom >= 10}
											>
												<ZoomIn />
											</IconButton>
											<IconButton
												size="small"
												onClick={() => setZoom(z => Math.max(z / 1.2, 0.2))}
												disabled={zoom <= 0.2}
											>
												<ZoomOut />
											</IconButton>
											<IconButton size="small" onClick={resetZoom}>
												<CenterFocusStrong />
											</IconButton>
											<Typography variant="caption" align="center">
												{Math.round(zoom * 100)}%
											</Typography>
										</Box>

										{/* Instruções */}
										<Box
											sx={{
												position: "absolute",
												top: 16,
												left: 16,
												bgcolor: "rgba(0, 0, 0, 0.8)",
												color: "white",
												padding: 1.5,
												borderRadius: 1,
												fontSize: "0.75rem",
											}}
										>
											<Typography variant="caption" display="block" fontWeight="bold">
												🎯 CONTROLES:
											</Typography>
											<Typography variant="caption" display="block">
												• Clique: Selecionar/mover ponto
											</Typography>
											<Typography variant="caption" display="block">
												• Shift+Arrastar: Mover visualização
											</Typography>
											<Typography variant="caption" display="block">
												• Scroll: Zoom preciso
											</Typography>
											<Typography variant="caption" display="block" sx={{ color: '#4ecdc4', fontWeight: 'bold' }}>
												📍 Coordenadas originais garantidas
											</Typography>
										</Box>

										{/* Debug info */}
										<Box
											sx={{
												position: "absolute",
												top: 16,
												right: 16,
												bgcolor: "rgba(255, 255, 255, 0.95)",
												padding: 1,
												borderRadius: 1,
												fontSize: "0.7rem",
											}}
										>
											<Typography variant="caption" display="block" fontWeight="bold">
												📊 DEBUG:
											</Typography>
											<Typography variant="caption" display="block">
												Pontos: {bodyPoints.length}
											</Typography>
											<Typography variant="caption" display="block">
												Tornozelos: {bodyPoints.filter(p => p.name.includes('ankle')).length}
											</Typography>
											<Typography variant="caption" display="block">
												Zoom: {Math.round(zoom * 100)}%
											</Typography>
											<Typography variant="caption" display="block">
												Plano: {currentPlane}
											</Typography>
											{selectedPoint !== null && bodyPoints[selectedPoint] && (
												<Typography variant="caption" display="block" sx={{ color: '#ff0000', fontWeight: 'bold' }}>
													Selecionado: {bodyPoints[selectedPoint].name}
												</Typography>
											)}
										</Box>
									</>
								)
							)}
						</Box>

						{/* Painel lateral */}
						<Box
							sx={{
								flex: 1,
								maxWidth: 350,
								bgcolor: "#fff",
								borderRadius: 2,
								boxShadow: 1,
								p: 2,
								overflowY: "auto",
							}}
						>
							<Typography variant="subtitle1" fontWeight="bold" mb={1}>
								Resposta da IA
							</Typography>
							<Typography variant="body2" mb={2}>
								{analysisResult || "Nenhuma resposta ainda."}
							</Typography>

							<Typography variant="subtitle2" fontWeight="bold" mb={1}>
								Informações dos Pontos
							</Typography>
							<Typography variant="caption" color="text.secondary">
								Total de pontos detectados: {bodyPoints.length}
							</Typography>
						</Box>
					</Box>

					{/* Footer */}
					<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
						<Button variant="outlined" onClick={() => setIsModalOpen(false)}>
							Cancelar
						</Button>
						<Button
							variant="contained"
							onClick={handleSavePoints}
							startIcon={<SaveIcon />}
							disabled={isProcessing || bodyPoints.length === 0}
						>
							Salvar Ajustes
						</Button>
					</Box>
				</Paper>
			</Modal>

			{/* Loading inicial */}
			{isLoading && (
				<Box
					sx={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
						bgcolor: "rgba(255, 255, 255, 0.8)",
						zIndex: 9999,
					}}
				>
					<CircularProgress size={60} />
					<Typography sx={{ mt: 2 }}>Inicializando TensorFlow...</Typography>
				</Box>
			)}

			{/* Diálogo de escolha de upload */}
			<Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} maxWidth="sm" fullWidth>
				<DialogTitle>
					<Typography variant="h6" fontWeight="bold">
						📸 Como deseja enviar a foto?
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Escolha o método de upload para {getCurrentPlaneTitle()}
					</Typography>
				</DialogTitle>
				<DialogContent>
					<List>
						<ListItem onClick={handleComputerUpload} sx={{ cursor: 'pointer' }}>
							<ListItemIcon>
								<Computer sx={{ color: '#1976d2' }} />
							</ListItemIcon>
							<ListItemText
								primary="📁 Enviar do computador"
								secondary="Selecione uma imagem do seu dispositivo"
							/>
						</ListItem>
						<Divider />
						<ListItem onClick={handleMobileUpload} sx={{ cursor: 'pointer' }}>
							<ListItemIcon>
								<CameraAlt sx={{ color: '#2e7d32' }} />
							</ListItemIcon>
							<ListItemText
								primary="📱 Usar câmera do celular"
								secondary="Escaneie o QR code com seu celular"
							/>
						</ListItem>
					</List>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowUploadDialog(false)}>
						Cancelar
					</Button>
				</DialogActions>
			</Dialog>

			{/* Diálogo do QR Code */}
			<Dialog open={showQRDialog} onClose={() => setShowQRDialog(false)} maxWidth="sm" fullWidth>
				<DialogTitle>
					<Typography variant="h6" fontWeight="bold">
						📱 Escaneie o QR Code
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Use a câmera do seu celular para tirar a foto
					</Typography>
				</DialogTitle>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
						<Box sx={{ 
							p: 3, 
							bgcolor: 'white', 
							borderRadius: 2, 
							boxShadow: 2,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center'
						}}>
							<Box sx={{ 
								bgcolor: 'white', 
								p: 2, 
								borderRadius: 1,
								display: 'flex',
								justifyContent: 'center'
							}}>
								<QRCode 
									value={qrCodeUrl} 
									size={200}
									level="H"
									bgColor="white"
									fgColor="black"
								/>
							</Box>
						</Box>
						
						<Typography variant="body2" textAlign="center" color="text.secondary">
							<strong>Instruções:</strong>
						</Typography>
						<Box component="ul" sx={{ pl: 2, m: 0 }}>
							<Typography component="li" variant="body2" color="text.secondary">
								Abra a câmera do seu celular
							</Typography>
							<Typography component="li" variant="body2" color="text.secondary">
								Aponte para o QR code acima
							</Typography>
							<Typography component="li" variant="body2" color="text.secondary">
								Clique no link que aparecer
							</Typography>
							<Typography component="li" variant="body2" color="text.secondary">
								Tire a foto e envie
							</Typography>
						</Box>
						
						<Box sx={{ 
							bgcolor: '#e3f2fd', 
							p: 2, 
							borderRadius: 1, 
							border: '1px solid #2196f3',
							width: '100%'
						}}>
							<Typography variant="caption" color="primary" fontWeight="bold">
								⏳ Aguardando upload...
							</Typography>
							<Typography variant="caption" color="text.secondary" display="block">
								O sistema verificará automaticamente quando a foto for enviada
							</Typography>
						</Box>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowQRDialog(false)}>
						Cancelar
					</Button>
				</DialogActions>
			</Dialog>

			{/* SEÇÃO DE AVALIAÇÃO DOS PÉS */}
			<Box marginTop={4}>
				<Typography variant="h6" className="form-section-title">
					AVALIAÇÃO DOS PÉS
				</Typography>

				{/* Tamanho do pé */}
				<Box className="form-row">
					<Box className="form-field full-width">
						<Typography className="field-label">Tamanho do pé</Typography>
						<FormControl fullWidth variant="outlined" size="small">
							<Select
								name="footSize"
								value={patientData.footSize || ""}
								onChange={handleSelectChange}
								displayEmpty
							>
								<MenuItem value="" disabled>
									<em>Selecione</em>
								</MenuItem>
								<MenuItem value="34">34</MenuItem>
								<MenuItem value="35">35</MenuItem>
								<MenuItem value="36">36</MenuItem>
								<MenuItem value="37">37</MenuItem>
								<MenuItem value="38">38</MenuItem>
								<MenuItem value="39">39</MenuItem>
								<MenuItem value="40">40</MenuItem>
								<MenuItem value="41">41</MenuItem>
								<MenuItem value="42">42</MenuItem>
								<MenuItem value="43">43</MenuItem>
								<MenuItem value="44">44</MenuItem>
								<MenuItem value="45">45</MenuItem>
								<MenuItem value="46">46</MenuItem>
							</Select>
						</FormControl>
					</Box>
				</Box>

				{/* Tipo de Palmilha */}
				<Box className="form-row">
					<Box className="form-field full-width">
						<Typography variant="subtitle1" fontWeight="bold">
							TIPO DE PALMILHA
						</Typography>
					</Box>
				</Box>

				{/* Tipo de Calçado */}
				<Box className="form-row">
					<Box className="form-field full-width">
						<Typography className="field-label">Tipo de Calçado</Typography>
						<Box className="options-group">
							<FormControlLabel
								control={
									<Checkbox
										checked={patientData.footwearType?.sneakers || false}
										onChange={(e) => handleCheckboxChange(e, "footwearType")}
										name="sneakers"
									/>
								}
								label="Tênis/Sapatênis"
							/>
							<FormControlLabel
								control={
									<Checkbox
										checked={patientData.footwearType?.shoes || false}
										onChange={(e) => handleCheckboxChange(e, "footwearType")}
										name="shoes"
									/>
								}
								label="Sapato/Sapatilha"
							/>
						</Box>
					</Box>
				</Box>

				{/* Características da Palmilha */}
				<Box className="form-row">
					<Box className="form-field full-width">
						<Typography className="field-label">
							Características da Palmilha
						</Typography>
						<Box className="options-group">
							<FormControlLabel
								control={
									<Checkbox
										checked={
											patientData.insoleCharacteristics?.hiTechComfort || false
										}
										onChange={(e) =>
											handleCheckboxChange(e, "insoleCharacteristics")
										}
										name="hiTechComfort"
									/>
								}
								label="Hi-Tech Conforto"
							/>
							<FormControlLabel
								control={
									<Checkbox
										checked={patientData.insoleCharacteristics?.standard || false}
										onChange={(e) =>
											handleCheckboxChange(e, "insoleCharacteristics")
										}
										name="standard"
									/>
								}
								label="Standard"
							/>
							<FormControlLabel
								control={
									<Checkbox
										checked={patientData.insoleCharacteristics?.flexiGel || false}
										onChange={(e) =>
											handleCheckboxChange(e, "insoleCharacteristics")
										}
										name="flexiGel"
									/>
								}
								label="FlexiGel"
							/>
							<FormControlLabel
								control={
									<Checkbox
										checked={patientData.insoleCharacteristics?.podoTop || false}
										onChange={(e) =>
											handleCheckboxChange(e, "insoleCharacteristics")
										}
										name="podoTop"
									/>
								}
								label="PodoTOP"
							/>
							<FormControlLabel
								control={
									<Checkbox
										checked={patientData.insoleCharacteristics?.podoPlus || false}
										onChange={(e) =>
											handleCheckboxChange(e, "insoleCharacteristics")
										}
										name="podoPlus"
									/>
								}
								label="PodoPlus SoftDry"
							/>
							<FormControlLabel
								control={
									<Checkbox
										checked={
											patientData.insoleCharacteristics?.hiTechPosturology ||
											false
										}
										onChange={(e) =>
											handleCheckboxChange(e, "insoleCharacteristics")
										}
										name="hiTechPosturology"
									/>
								}
								label="Hi-Tech Posturologia"
							/>
							<FormControlLabel
								control={
									<Checkbox
										checked={patientData.insoleCharacteristics?.sports || false}
										onChange={(e) =>
											handleCheckboxChange(e, "insoleCharacteristics")
										}
										name="sports"
									/>
								}
								label="Esportiva"
							/>
							<FormControlLabel
								control={
									<Checkbox
										checked={
											patientData.insoleCharacteristics?.ecoSystem || false
										}
										onChange={(e) =>
											handleCheckboxChange(e, "insoleCharacteristics")
										}
										name="ecoSystem"
									/>
								}
								label="EcoSystem"
							/>
						</Box>
					</Box>
				</Box>

				{/* Arco Plantar Esquerdo - Plantigrafia */}
				<Box className="form-row">
					<Box className="form-field full-width">
						<Typography variant="subtitle1" fontWeight="bold" marginTop={2}>
							Arco Plantar Esquerdo | Plantigrafia
						</Typography>
						<Box display="flex" gap={2} marginTop={1} flexWrap="wrap">
							<Box className="foot-arch-option">
								<img src={esquerdoPlano3} alt="3 | Plano" width={70} />
								<RadioGroup
									name="leftArchType"
									value={patientData.leftArchType || ""}
									onChange={(e) => handleRadioChange(e, "leftArchType")}
								>
									<FormControlLabel
										value="3|plano"
										control={<Radio />}
										label="3 | Plano"
									/>
								</RadioGroup>
							</Box>
							<Box className="foot-arch-option">
								<img src={esquerdoPlano2} alt="2 | Plano" width={70} />
								<RadioGroup
									name="leftArchType"
									value={patientData.leftArchType || ""}
									onChange={(e) => handleRadioChange(e, "leftArchType")}
								>
									<FormControlLabel
										value="2|plano"
										control={<Radio />}
										label="2 | Plano"
									/>
								</RadioGroup>
							</Box>
							<Box className="foot-arch-option">
								<img src={esquerdoPlano1} alt="1 | Plano" width={70} />
								<RadioGroup
									name="leftArchType"
									value={patientData.leftArchType || ""}
									onChange={(e) => handleRadioChange(e, "leftArchType")}
								>
									<FormControlLabel
										value="1|plano"
										control={<Radio />}
										label="1 | Plano"
									/>
								</RadioGroup>
							</Box>
							<Box className="foot-arch-option">
								<img src={esquerdoNeutro} alt="N" width={70} />
								<RadioGroup
									name="leftArchType"
									value={patientData.leftArchType || ""}
									onChange={(e) => handleRadioChange(e, "leftArchType")}
								>
									<FormControlLabel
										value="normal"
										control={<Radio />}
										label="N"
									/>
								</RadioGroup>
							</Box>
							<Box className="foot-arch-option">
								<img src={esquerdoCavo1} alt="1 | Cavo" width={70} />
								<RadioGroup
									name="leftArchType"
									value={patientData.leftArchType || ""}
									onChange={(e) => handleRadioChange(e, "leftArchType")}
								>
									<FormControlLabel
										value="1|cavo"
										control={<Radio />}
										label="1 | Cavo"
									/>
								</RadioGroup>
							</Box>
							<Box className="foot-arch-option">
								<img src={esquerdoCavo2} alt="2 | Cavo" width={70} />
								<RadioGroup
									name="leftArchType"
									value={patientData.leftArchType || ""}
									onChange={(e) => handleRadioChange(e, "leftArchType")}
								>
									<FormControlLabel
										value="2|cavo"
										control={<Radio />}
										label="2 | Cavo"
									/>
								</RadioGroup>
							</Box>
							<Box className="foot-arch-option">
								<img src={esquerdoCavo3} alt="3 | Cavo" width={70} />
								<RadioGroup
									name="leftArchType"
									value={patientData.leftArchType || ""}
									onChange={(e) => handleRadioChange(e, "leftArchType")}
								>
									<FormControlLabel
										value="3|cavo"
										control={<Radio />}
										label="3 | Cavo"
									/>
								</RadioGroup>
							</Box>
						</Box>
					</Box>
				</Box>

				{/* Arco Plantar Direito - Plantigrafia */}
				<Box className="form-row">
					<Box className="form-field full-width">
						<Typography variant="subtitle1" fontWeight="bold" marginTop={2}>
							Arco Plantar Direito | Plantigrafia
						</Typography>
						<Box display="flex" gap={2} marginTop={1} flexWrap="wrap">
							<Box className="foot-arch-option">
								<img src={direitoCavo3} alt="3 | Cavo" width={70} />
								<RadioGroup
									name="rightArchType"
									value={patientData.rightArchType || ""}
									onChange={(e) => handleRadioChange(e, "rightArchType")}
								>
									<FormControlLabel
										value="3|cavo"
										control={<Radio />}
										label="3 | Cavo"
									/>
								</RadioGroup>
							</Box>
							<Box className="foot-arch-option">
								<img src={direitoCavo2} alt="2 | Cavo" width={70} />
								<RadioGroup
									name="rightArchType"
									value={patientData.rightArchType || ""}
									onChange={(e) => handleRadioChange(e, "rightArchType")}
								>
									<FormControlLabel
										value="2|cavo"
										control={<Radio />}
										label="2 | Cavo"
									/>
								</RadioGroup>
							</Box>
							<Box className="foot-arch-option">
								<img src={direitoCavo1} alt="1 | Cavo" width={70} />
								<RadioGroup
									name="rightArchType"
									value={patientData.rightArchType || ""}
									onChange={(e) => handleRadioChange(e, "rightArchType")}
								>
									<FormControlLabel
										value="1|cavo"
										control={<Radio />}
										label="1 | Cavo"
									/>
								</RadioGroup>
							</Box>
							<Box className="foot-arch-option">
								<img src={direitoNeutro} alt="N" width={70} />
								<RadioGroup
									name="rightArchType"
									value={patientData.rightArchType || ""}
									onChange={(e) => handleRadioChange(e, "rightArchType")}
								>
									<FormControlLabel
										value="normal"
										control={<Radio />}
										label="N"
									/>
								</RadioGroup>
							</Box>
							<Box className="foot-arch-option">
								<img src={direitoPlano1} alt="1 | Plano" width={70} />
								<RadioGroup
									name="rightArchType"
									value={patientData.rightArchType || ""}
									onChange={(e) => handleRadioChange(e, "rightArchType")}
								>
									<FormControlLabel
										value="1|plano"
										control={<Radio />}
										label="1 | Plano"
									/>
								</RadioGroup>
							</Box>
							<Box className="foot-arch-option">
								<img src={direitoPlano2} alt="2 | Plano" width={70} />
								<RadioGroup
									name="rightArchType"
									value={patientData.rightArchType || ""}
									onChange={(e) => handleRadioChange(e, "rightArchType")}
								>
									<FormControlLabel
										value="2|plano"
										control={<Radio />}
										label="2 | Plano"
									/>
								</RadioGroup>
							</Box>
							<Box className="foot-arch-option">
								<img src={direitoPlano3} alt="3 | Plano" width={70} />
								<RadioGroup
									name="rightArchType"
									value={patientData.rightArchType || ""}
									onChange={(e) => handleRadioChange(e, "rightArchType")}
								>
									<FormControlLabel
										value="3|plano"
										control={<Radio />}
										label="3 | Plano"
									/>
								</RadioGroup>
							</Box>
						</Box>
					</Box>
				</Box>

				{/* Arco Plantar Esquerdo - Lateral */}
				<Box className="form-row">
					<Box className="form-field full-width">
						<Typography variant="subtitle1" fontWeight="bold" marginTop={2}>
							Arco Plantar Esquerdo | Vista Lateral
						</Typography>
						<Box display="flex" gap={2} marginTop={1}>
							<Box className="foot-arch-type">
								<img src={lateralCavo} alt="Cavo" width={70} />
								<RadioGroup
									name="leftArchSimple"
									value={patientData.leftArchSimple || ""}
									onChange={(e) => handleRadioChange(e, "leftArchSimple")}
								>
									<FormControlLabel
										value="cavo"
										control={<Radio />}
										label="Cavo"
									/>
								</RadioGroup>
							</Box>
							<Box className="foot-arch-type">
								<img src={lateralNeutro} alt="Neutro" width={70} />
								<RadioGroup
									name="leftArchSimple"
									value={patientData.leftArchSimple || ""}
									onChange={(e) => handleRadioChange(e, "leftArchSimple")}
								>
									<FormControlLabel
										value="neutro"
										control={<Radio />}
										label="Neutro"
									/>
								</RadioGroup>
							</Box>
							<Box className="foot-arch-type">
								<img src={lateralPlano} alt="Plano" width={70} />
								<RadioGroup
									name="leftArchSimple"
									value={patientData.leftArchSimple || ""}
									onChange={(e) => handleRadioChange(e, "leftArchSimple")}
								>
									<FormControlLabel
										value="plano"
										control={<Radio />}
										label="Plano"
									/>
								</RadioGroup>
							</Box>
						</Box>
					</Box>
				</Box>

				{/* Arco Plantar Direito - Lateral */}
				<Box className="form-row">
					<Box className="form-field full-width">
						<Typography variant="subtitle1" fontWeight="bold" marginTop={2}>
							Arco Plantar Direito | Vista Lateral
						</Typography>
						<Box display="flex" gap={2} marginTop={1}>
							<Box className="foot-arch-type">
								<img src={lateralCavo} alt="Cavo" width={70} />
								<RadioGroup
									name="rightArchSimple"
									value={patientData.rightArchSimple || ""}
									onChange={(e) => handleRadioChange(e, "rightArchSimple")}
								>
									<FormControlLabel
										value="cavo"
										control={<Radio />}
										label="Cavo"
									/>
								</RadioGroup>
							</Box>
							<Box className="foot-arch-type">
								<img src={lateralNeutro} alt="Neutro" width={70} />
								<RadioGroup
									name="rightArchSimple"
									value={patientData.rightArchSimple || ""}
									onChange={(e) => handleRadioChange(e, "rightArchSimple")}
								>
									<FormControlLabel
										value="neutro"
										control={<Radio />}
										label="Neutro"
									/>
								</RadioGroup>
							</Box>
							<Box className="foot-arch-type">
								<img src={lateralPlano} alt="Plano" width={70} />
								<RadioGroup
									name="rightArchSimple"
									value={patientData.rightArchSimple || ""}
									onChange={(e) => handleRadioChange(e, "rightArchSimple")}
								>
									<FormControlLabel
										value="plano"
										control={<Radio />}
										label="Plano"
									/>
								</RadioGroup>
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default PostureEvaluation;