/**
 * Serviço de medições para impressão da palmilha
 */

export const MEASUREMENT_CONSTANTS = {
	CIRCLE_REF_SIZE: 25,
  
	// A4 em CSS px (96 DPI)
	A4_WIDTH_PX: 794,
	A4_HEIGHT_PX: 1123,
  
	PRINT_MARGIN_PX: 70, // Margem ajustada para permitir mais angulação
  
	// Medidas do path original (em coordenadas do próprio SVG)
	ORIGINAL_PATH_WIDTH: 211,   // ~diferença de X no path
	ORIGINAL_PATH_HEIGHT: 660,  // ~diferença de Y no path
  
	// Pivô/escala base usados no seu transform (mantém o “formato” da palmilha)
	BASE_PIVOT_X: 150,
	BASE_PIVOT_Y: 320,
	BASE_SCALE_X: 0.92,
	BASE_SCALE_Y: 0.85,
  
	// Conversão cm→px (96 DPI)
	CM_TO_PX_RATIO: 37.7952755906,
  } as const;
  
  /**
   * Comprimento do pé (cm) por numeração EU/BR
   */
  export const getFootLengthFromShoeSize = (shoeSize: number): number => {
	const map: Record<number, number> = {
	  32: 21.3, 33: 21.9, 34: 22.6, 35: 23.3, 36: 24.0, 37: 24.6,
	  38: 25.3, 39: 26.0, 40: 26.6, 41: 27.3, 42: 28.0, 43: 28.6,
	  44: 29.3, 45: 30.0, 46: 30.6, 47: 31.3, 48: 32.0
	};
	if (map[shoeSize]) return map[shoeSize];
	return 21.3 + (shoeSize - 32) * 0.67;
  };
  
  /**
   * Largura relativa por numeração (leve variação – 1% por número em relação ao 41)
   * Mantemos conservador para não “engordar” demais e inviabilizar o encaixe em A4.
   */
  export const getFootWidthFactorFromShoeSize = (shoeSize: number): number => {
	const delta = shoeSize - 41;         // nº de passos a partir do 41
	const perStep = 0.01;                // 1% por número
	const factor = 1 + delta * perStep;  // 41 => 1.00 ; 48 => 1.07 ; 32 => 0.91
	return Math.max(0.9, Math.min(1.1, factor));
  };
  
  export interface PrintScaleResult {
	scaleX: number;     // escala total X a aplicar no path
	scaleY: number;     // escala total Y a aplicar no path (1:1 real)
	viewBox: string;    // viewBox do A4
	rotation: number;   // ângulo final
	angleBySize: number;
	minAngleToFit: number;
  }
  
  /** Ângulo "por tamanho": 32→0°, 48→30° (rotação mais visível) */
  const angleFromShoeSize = (shoeSize: number): number => {
	const min = 32, max = 48;
	const t = Math.max(0, Math.min(1, (shoeSize - min) / (max - min)));
	
	// Rotação mais visível: máximo de 30° para tamanho 48
	const maxRotation = 30; // Ângulo mais visível
	
	return t * maxRotation;
  };
  
  /** Calcula o menor ângulo (0–90°) que faz caber W×H na área útil A×B */
  const computeMinAngleToFit = (
	W: number, H: number, A: number, B: number
  ): number => {
	let best = 0;
	for (let ang = 0; ang <= 90; ang += 0.1) {
	  const r = (ang * Math.PI) / 180;
	  const w = Math.abs(W * Math.cos(r)) + Math.abs(H * Math.sin(r));
	  const h = Math.abs(W * Math.sin(r)) + Math.abs(H * Math.cos(r));
	  if (w <= A && h <= B) best = ang; else break;
	}
	return best;
  };
  
  /**
   * Calcula escalas totais (incluindo o formato base) e rotação final:
   * - scaleY dá o comprimento 1:1 (em cm) no papel
   * - scaleX mantém o “formato base” (0.92/0.85) + largura por numeração
   * - rotation = max(ânguloPorTamanho, ânguloMínimoParaCaber), limitado a 45°
   */
  export const getPrintScaleFromShoeSize = (shoeSize: number): PrintScaleResult => {
	const {
	  A4_WIDTH_PX, A4_HEIGHT_PX, PRINT_MARGIN_PX,
	  ORIGINAL_PATH_WIDTH, ORIGINAL_PATH_HEIGHT,
	  BASE_SCALE_X, BASE_SCALE_Y
	} = MEASUREMENT_CONSTANTS;
  
	const footLenCm = getFootLengthFromShoeSize(shoeSize);
	const footLenPx = footLenCm * MEASUREMENT_CONSTANTS.CM_TO_PX_RATIO;
  
	// Escala Y total para dar altura real (1:1)
	const scaleY = footLenPx / ORIGINAL_PATH_HEIGHT;
  
	// Escala X total = proporção base (X/Y) * variação por numeração * scaleY
	// Usamos razão base (0.92/0.85) para manter formato visual da palmilha.
	const baseRatioXY = BASE_SCALE_X / BASE_SCALE_Y; // ~1.082
	const widthFactor = getFootWidthFactorFromShoeSize(shoeSize); // ~0.9..1.1
	const scaleX = scaleY * baseRatioXY * widthFactor;
  
	// Medidas da palmilha (já escaladas) antes de rotacionar
	const W = ORIGINAL_PATH_WIDTH  * scaleX;
	const H = ORIGINAL_PATH_HEIGHT * scaleY;
  
	const usableW = A4_WIDTH_PX  - 2 * PRINT_MARGIN_PX;
	const usableH = A4_HEIGHT_PX - 2 * PRINT_MARGIN_PX;
  
	const angleBySize = angleFromShoeSize(shoeSize);
	const minAngleToFit = computeMinAngleToFit(W, H, usableW, usableH);
	
	// PRESERVAR TAMANHO REAL: Usar apenas o ângulo necessário, sem reduzir escala
	// Prioridade: minAngleToFit para garantir que cabe, mas manter escala 1:1
	const rotation = Math.max(angleBySize, minAngleToFit);
	
	// MANTER escalas originais para preservar tamanho real (1:1 em cm)
	const finalScaleX = scaleX;
	const finalScaleY = scaleY;
  
	return {
	  scaleX: finalScaleX,
	  scaleY: finalScaleY,
	  viewBox: `0 0 ${A4_WIDTH_PX} ${A4_HEIGHT_PX}`,
	  rotation,
	  angleBySize,
	  minAngleToFit
	};
  };
  