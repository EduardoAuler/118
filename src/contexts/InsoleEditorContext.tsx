import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import React, {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { db } from "../services/firebaseconfig";

// Interface para as peças da palmilha
interface InsoleComponent {
	id: string;
	name: string;
	type: string;
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
}

// Interface para o modelo da palmilha
interface InsoleModel {
	id: string;
	footId: "left" | "right";
	patientId: string;
	patientName: string;
	footSize?: number;
	shoeSize?: number;
	components?: InsoleComponent[];
	backgroundImage: string | null;
	notes?: string;
	createdAt: string | Date;
	updatedAt: string | Date;
	selectedPieces: string[];
	guidePositions: GuidePosition[];
	measureCircle: { cx: number; cy: number };
	backgroundPosition: { x: number; y: number; scale: number };
}

// Interface para posições de guias
interface GuidePosition {
	id: string;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

// Interface para posição de círculo de medida
interface CirclePosition {
	cx: number;
	cy: number;
}

// Interface do contexto
interface InsoleEditorContextType {
	currentModel: InsoleModel | null;
	setCurrentModel: React.Dispatch<React.SetStateAction<InsoleModel | null>>;
	currentStep: number;
	setCurrentStep: (step: number) => void;
	selectedPieces: string[];
	setSelectedPieces: React.Dispatch<React.SetStateAction<string[]>>;

	// Novas propriedades para posicionamento
	guidePositions: GuidePosition[];
	setGuidePositions: React.Dispatch<React.SetStateAction<GuidePosition[]>>;
	measureCircle: { cx: number; cy: number };
	setMeasureCircle: React.Dispatch<
		React.SetStateAction<{ cx: number; cy: number }>
	>;

	// Novas propriedades para fundo
	backgroundPosition: { x: number; y: number; scale: number };
	setBackgroundPosition: React.Dispatch<
		React.SetStateAction<{ x: number; y: number; scale: number }>
	>;

	addComponent: (component: InsoleComponent) => void;
	removeComponent: (componentId: string) => void;
	updateComponent: (
		componentId: string,
		updates: Partial<InsoleComponent>
	) => void;
	saveModel: () => Promise<void>;
	loadModel: (
		modelId: string,
		patientId: string,
		footSide: "left" | "right"
	) => Promise<void>;
	createNewModel: (
		footId: "left" | "right",
		patientId: string,
		patientName: string
	) => void;

	// Nova função para atualizar a imagem de fundo
	updateBackgroundImage: (imageData: string) => void;
	
	// Função para atualizar o tamanho do calçado
	updateShoeSize: (size: number) => void;
}

// Criando o contexto
const InsoleEditorContext = createContext<InsoleEditorContextType | undefined>(
	undefined
);

// Provider component
export const InsoleEditorProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [currentModel, setCurrentModel] = useState<InsoleModel | null>(null);
	const [currentStep, setCurrentStep] = useState<number>(1);
	const [selectedPieces, setSelectedPieces] = useState<string[]>([]);

	// Estados para posicionamento
	const [guidePositions, setGuidePositions] = useState<GuidePosition[]>([
		{ id: "horizontal1", x1: 0, y1: 200, x2: 300, y2: 200 },
		{ id: "horizontal2", x1: 0, y1: 400, x2: 300, y2: 400 },
		{ id: "vertical", x1: 150, y1: 0, x2: 150, y2: 600 },
	]);

	const [measureCircle, setMeasureCircle] = useState<{
		cx: number;
		cy: number;
	}>({
		cx: 150,
		cy: 320,
	});

	// Estados para fundo
	const [backgroundPosition, setBackgroundPosition] = useState<{
		x: number;
		y: number;
		scale: number;
	}>({
		x: 0,
		y: 0,
		scale: 1,
	});

	// Cria um novo modelo
	const createNewModel = useCallback(
		(footId: "left" | "right", patientId: string, patientName: string) => {
			const newModel: InsoleModel = {
				id: `insole-${Date.now()}`,
				footId,
				patientId,
				patientName,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				backgroundImage: null,
				selectedPieces: [],
				guidePositions: guidePositions,
				measureCircle: measureCircle,
				backgroundPosition: backgroundPosition,
			};

			setCurrentModel(newModel);
			console.log("Novo modelo criado:", newModel);
		},
		[guidePositions, measureCircle, backgroundPosition]
	);

	// Adiciona um componente ao modelo
	const addComponent = useCallback(
		(component: InsoleComponent) => {
			if (!currentModel) return;

			setCurrentModel({
				...currentModel,
				components: [...(currentModel.components || []), component],
				updatedAt: new Date().toISOString(),
			});
		},
		[currentModel, setCurrentModel]
	);

	// Remove um componente do modelo
	const removeComponent = useCallback(
		(componentId: string) => {
			if (!currentModel) return;
			if (!currentModel.components) return;

			setCurrentModel({
				...currentModel,
				components: currentModel.components.filter(
					(comp) => comp.id !== componentId
				),
				updatedAt: new Date().toISOString(),
			});
		},
		[currentModel, setCurrentModel]
	);

	// Atualiza um componente do modelo
	const updateComponent = useCallback(
		(componentId: string, updates: Partial<InsoleComponent>) => {
			if (!currentModel) return;
			if (!currentModel.components) return;

			setCurrentModel({
				...currentModel,
				components: currentModel.components.map((comp) =>
					comp.id === componentId ? { ...comp, ...updates } : comp
				),
				updatedAt: new Date().toISOString(),
			});
		},
		[currentModel, setCurrentModel]
	);

	// Atualiza a imagem de fundo do modelo
	const updateBackgroundImage = useCallback(
		(imageData: string) => {
			if (!currentModel) return;

			setCurrentModel((prev) => {
				if (!prev) return null;
				return {
					...prev,
					backgroundImage: imageData,
				};
			});
		},
		[currentModel]
	);

	// Função para atualizar o tamanho do calçado
	const updateShoeSize = useCallback(
		(size: number) => {
			if (!currentModel) return;

			setCurrentModel((prev) => {
				if (!prev) return null;
				return {
					...prev,
					shoeSize: size,
					updatedAt: new Date().toISOString(),
				};
			});
		},
		[currentModel]
	);

	// Salva o modelo atual
	const saveModel = useCallback(async () => {
		if (!currentModel) {
			throw new Error("No current model to save");
		}

		// Atualizar modelo com as informações atuais
		const updatedModel: InsoleModel = {
			...currentModel,
			updatedAt: new Date().toISOString(),
			selectedPieces,
			guidePositions,
			measureCircle,
			backgroundPosition,
		};

		try {
			console.log("Salvando modelo:", updatedModel);

			// Salvar no Firebase
			const modelId = updatedModel.id;
			const patientId = updatedModel.patientId;

			// Referência ao documento do paciente
			const patientDocRef = doc(db, "pacientes", patientId);

			// Verificar se o paciente existe
			const patientDoc = await getDoc(patientDocRef);
			if (!patientDoc.exists()) {
				throw new Error(`Paciente com ID ${patientId} não encontrado`);
			}

			// Salvar o modelo como um subdocumento do paciente
			const modelDocRef = doc(collection(patientDocRef, "insoles"), modelId);
			await setDoc(modelDocRef, {
				...updatedModel,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			// Atualizar o documento do paciente para indicar que tem palmilha
			const footSide = updatedModel.footId;
			await setDoc(
				patientDocRef,
				{
					...(patientDoc.data() || {}),
					[footSide === "left" ? "hasLeftInsole" : "hasRightInsole"]: true,
				},
				{ merge: true }
			);

			// Atualizar o modelo atual
			setCurrentModel(updatedModel);

			console.log("Modelo salvo com sucesso!");
		} catch (error) {
			console.error("Erro ao salvar modelo:", error);
			throw error;
		}
	}, [
		currentModel,
		selectedPieces,
		guidePositions,
		measureCircle,
		backgroundPosition,
	]);

	// Carrega um modelo existente
	const loadModel = useCallback(
		async (modelId: string, patientId: string, footSide: "left" | "right") => {
			try {
				console.log("Carregando modelo:", modelId, "do paciente:", patientId);

				// Referência ao documento do modelo
				const patientDocRef = doc(db, "pacientes", patientId);
				const modelDocRef = doc(collection(patientDocRef, "insoles"), modelId);

				const modelDoc = await getDoc(modelDocRef);

				if (modelDoc.exists()) {
					const modelData = modelDoc.data() as InsoleModel;
					setCurrentModel(modelData);

					// Carregar configurações salvas
					if (modelData.selectedPieces?.length) {
						setSelectedPieces(modelData.selectedPieces);
					}

					if (modelData.guidePositions?.length) {
						setGuidePositions(modelData.guidePositions);
					}

					if (modelData.measureCircle) {
						setMeasureCircle(modelData.measureCircle);
					}

					if (modelData.backgroundPosition) {
						setBackgroundPosition(modelData.backgroundPosition);
					}

					console.log("Modelo carregado com sucesso!");
				} else {
					// Se o modelo não existir, cria um novo
					console.log("Modelo não encontrado. Criando um novo...");

					// Buscar nome do paciente
					const patientDoc = await getDoc(patientDocRef);
					const patientName = patientDoc.exists()
						? patientDoc.data().name || "Paciente"
						: "Paciente";

					createNewModel(footSide, patientId, patientName);
				}
			} catch (error) {
				console.error("Erro ao carregar modelo:", error);
				throw error;
			}
		},
		[
			setCurrentModel,
			setGuidePositions,
			setMeasureCircle,
			setBackgroundPosition,
			setSelectedPieces,
			createNewModel,
		]
	);

	// Sincronizar o modelo quando mudar
	useEffect(() => {
		if (currentModel) {
			// Sincronizar peças selecionadas
			if (currentModel.selectedPieces?.length) {
				setSelectedPieces(currentModel.selectedPieces);
			}

			// Sincronizar posições de guias
			if (currentModel.guidePositions?.length) {
				setGuidePositions(currentModel.guidePositions);
			}

			// Sincronizar círculo de medição
			if (currentModel.measureCircle) {
				setMeasureCircle(currentModel.measureCircle);
			}

			// Sincronizar posição e escala do fundo
			if (currentModel.backgroundPosition) {
				setBackgroundPosition(currentModel.backgroundPosition);
			}
		}
	}, [currentModel]);

	// Atualizar o modelo ao mudar de etapa
	const setCurrentStepWithUpdate = useCallback(
		(step: number) => {
			// Atualizar o modelo com as configurações atuais antes de mudar de etapa
			if (currentModel) {
				setCurrentModel((prev) => {
					if (!prev) return null;
					return {
						...prev,
						selectedPieces,
						guidePositions,
						measureCircle,
						backgroundPosition,
						updatedAt: new Date().toISOString(),
					};
				});
			}

			// Atualizar a etapa
			setCurrentStep(step);
		},
		[
			currentModel,
			selectedPieces,
			guidePositions,
			measureCircle,
			backgroundPosition,
		]
	);

	// Contexto disponibilizado pelo provider
	const contextValue: InsoleEditorContextType = {
		currentModel,
		setCurrentModel,
		currentStep,
		setCurrentStep: setCurrentStepWithUpdate,
		selectedPieces,
		setSelectedPieces,
		guidePositions,
		setGuidePositions,
		measureCircle,
		setMeasureCircle,
		backgroundPosition,
		setBackgroundPosition,
		addComponent,
		removeComponent,
		updateComponent,
		updateBackgroundImage,
		updateShoeSize,
		saveModel,
		loadModel,
		createNewModel,
	};

	return (
		<InsoleEditorContext.Provider value={contextValue}>
			{children}
		</InsoleEditorContext.Provider>
	);
};

// Hook personalizado para usar o contexto do editor
export const useInsoleEditor = () => {
	const context = useContext(InsoleEditorContext);
	if (context === undefined) {
		throw new Error(
			"useInsoleEditor deve ser usado dentro de um InsoleEditorProvider"
		);
	}
	return context;
};

export default InsoleEditorContext;
