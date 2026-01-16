import {
  getFootLengthFromShoeSize,
  getPrintScaleFromShoeSize,
  MEASUREMENT_CONSTANTS,
} from "./insoleMeasurementsService";

export interface PiecePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface PieceImages { [key: string]: string; }

export interface InsoleModel {
  footId: "left" | "right";
  shoeSize?: number;
}

export interface GuidePosition {
  id: string; x1: number; y1: number; x2: number; y2: number;
}

export interface PrintConfig {
  shoeSize: number;
  piecePositions: PiecePosition[];
  pieceImages: PieceImages;
  currentModel: InsoleModel | null;
  guidePositions?: GuidePosition[];
}

/* Paths */
const INSOLE_PATH_LEFT =
  "M144.16,660.68C58.72,659.74,50,607.26,50,607.26S39.72,574.69,33,519.8,14.8,358.35,6.88,313.34-.72,217,6.36,163.54C10.08,135.42,41.64,3.94,119.24,1.08c86-3.17,108.13,88.61,113.93,171.43,5.07,72.3-2,107.23-4.35,198.72s4.75,185.16-.79,208.95S210.23,661.42,144.16,660.68Z";

const INSOLE_PATH_RIGHT =
  "M91.8,660.68c85.45-.94,94.16-53.42,94.16-53.42s10.28-32.57,17-87.46,18.19-161.45,26.11-206.46,7.6-96.38.52-149.8C225.88,135.42,194.33,3.94,116.73,1.08,30.75-2.09,8.59,89.69,2.79,172.51c-5.06,72.3,2,107.23,4.35,198.72S2.4,556.39,7.93,580.18,25.74,661.42,91.8,660.68Z";

const getInsolePath = (footId: "left" | "right") =>
  footId === "left" ? INSOLE_PATH_LEFT : INSOLE_PATH_RIGHT;

/**
 * HTML da impressão:
 * - usa o mesmo pivô/escala base do seu exemplo para preservar o formato;
 * - centraliza no centro da folha e gira conforme tamanho/encaixe;
 * - comprimento 1:1 em cm no eixo Y.
 */
export const generatePrintContent = (config: PrintConfig): string => {
  const { shoeSize, currentModel, piecePositions, pieceImages } = config;

  const {
    A4_WIDTH_PX, A4_HEIGHT_PX, PRINT_MARGIN_PX,
    BASE_PIVOT_X, BASE_PIVOT_Y
  } = MEASUREMENT_CONSTANTS;

  const { scaleX, scaleY, viewBox, rotation, angleBySize, minAngleToFit } =
    getPrintScaleFromShoeSize(shoeSize);

  const footLengthCm = getFootLengthFromShoeSize(shoeSize);
  const footLengthPx = (footLengthCm * MEASUREMENT_CONSTANTS.CM_TO_PX_RATIO).toFixed(1);

  const pathD = getInsolePath(currentModel?.footId || "left");

  // Centro da folha A4
  const centerX = A4_WIDTH_PX / 2;
  const centerY = A4_HEIGHT_PX / 2;
  
  // Centro da palmilha - ajustado para posição mais baixa e mais à esquerda
  const palmillaCenterX = 130;    // Centro X mais à esquerda (era 105)
  const palmillaCenterY = 334;   // Centro Y mais para baixo

  // Debug das peças
  console.log('[DEBUG] Configuração de impressão:');
  console.log('- Tamanho do calçado:', shoeSize);
  console.log('- Peças posicionadas:', piecePositions?.length || 0);
  console.log('- Imagens disponíveis:', Object.keys(pieceImages).length);
  if (piecePositions && piecePositions.length > 0) {
    console.log('- Primeira peça:', piecePositions[0]);
    console.log('- Imagem da primeira peça:', pieceImages[piecePositions[0].id]);
  }

  // Renderizar as peças podais
  const renderPieces = () => {
    if (!piecePositions || piecePositions.length === 0) {
      return '';
    }
    
    return piecePositions.map(piece => {
      const pieceImage = pieceImages[piece.id];
      if (!pieceImage) {
        return '';
      }
      
      return `
        <g transform="translate(${piece.x}, ${piece.y}) rotate(${piece.rotation})">
          <image
            href="${pieceImage}"
            x="${-piece.width / 2}"
            y="${-piece.height / 2}"
            width="${piece.width}"
            height="${piece.height}"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      `;
    }).join('');
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Palmilha – ${shoeSize}</title>
  <style>
    @page { size: A4; margin: 0; }
    html, body { margin:0; padding:0; width:210mm; height:297mm; background:white; }
    .print-svg { width:100%; height:100%; display:block; }
  </style>
</head>
<body>
  <svg viewBox="${viewBox}" class="print-svg" preserveAspectRatio="xMidYMid meet">
    <!-- Margem visual (opcional) -->
    <rect x="${PRINT_MARGIN_PX}" y="${PRINT_MARGIN_PX}" width="${A4_WIDTH_PX - 2*PRINT_MARGIN_PX}"
          height="${A4_HEIGHT_PX - 2*PRINT_MARGIN_PX}" fill="none" stroke="none"/>
    <g transform="
      translate(${centerX}, ${centerY})
      rotate(${rotation.toFixed(3)})
      scale(${scaleX.toFixed(6)}, ${scaleY.toFixed(6)})
      translate(${-palmillaCenterX}, ${-palmillaCenterY})
    ">
      <path d="${pathD}"
        fill="none"
        stroke="#211915"
        stroke-width="2"
        vector-effect="non-scaling-stroke"
        stroke-miterlimit="10"
        pointer-events="none"
      />
      <!-- Peças podais -->
      ${renderPieces()}
    </g>
  </svg>
  <script>
    console.log('[DEBUG] size=${shoeSize} | footLenPx=${footLengthPx}px | rotation=${rotation.toFixed(2)}° (bySize=${angleBySize.toFixed(2)}°, minFit=${minAngleToFit.toFixed(2)}°) | scaleX=${scaleX.toFixed(4)} | scaleY=${scaleY.toFixed(4)}');
    console.log('[DEBUG] Peças na impressão: ${piecePositions?.length || 0} peças');
  </script>
</body>
</html>`;
};

export const validatePrintConfig = (config: PrintConfig): { isValid: boolean; errorMessage?: string } => {
  if (!config.shoeSize || typeof config.shoeSize !== "number") {
    return { isValid: false, errorMessage: "Tamanho do calçado não informado" };
  }
  
  if (config.shoeSize < 32 || config.shoeSize > 50) {
    return { isValid: false, errorMessage: "Tamanho do calçado deve estar entre 32 e 50" };
  }
  
  if (!config.currentModel) {
    return { isValid: false, errorMessage: "Modelo de palmilha não encontrado" };
  }
  
  return { isValid: true };
};

export const getPrintDebugInfo = (config: PrintConfig): any => {
  const { shoeSize, currentModel, piecePositions } = config;
  const footLength = getFootLengthFromShoeSize(shoeSize);
  const printScale = getPrintScaleFromShoeSize(shoeSize);
  
  return {
    shoeSize,
    footLength,
    footId: currentModel?.footId,
    pieceCount: piecePositions.length,
    printScale,
    pieces: piecePositions.map(p => ({
      id: p.id,
      position: { x: p.x, y: p.y },
      size: { width: p.width, height: p.height },
      rotation: p.rotation
    }))
  };
};

export const testSizeCalculations = (shoeSize: number): void => {
  console.log(`=== Teste de Cálculos para Tamanho ${shoeSize} ===`);
  
  const footLength = getFootLengthFromShoeSize(shoeSize);
  console.log(`Comprimento do pé: ${footLength} cm`);
  
  const printScale = getPrintScaleFromShoeSize(shoeSize);
  console.log(`Escala de impressão:`, printScale);
  
  const footLengthPx = footLength * MEASUREMENT_CONSTANTS.CM_TO_PX_RATIO;
  console.log(`Comprimento em pixels: ${footLengthPx.toFixed(1)} px`);
  
  // Informações de centralização e verificação de corte
  const usableW = MEASUREMENT_CONSTANTS.A4_WIDTH_PX - 2 * MEASUREMENT_CONSTANTS.PRINT_MARGIN_PX;
  const usableH = MEASUREMENT_CONSTANTS.A4_HEIGHT_PX - 2 * MEASUREMENT_CONSTANTS.PRINT_MARGIN_PX;
  const scaledW = MEASUREMENT_CONSTANTS.ORIGINAL_PATH_WIDTH * printScale.scaleX;
  const scaledH = MEASUREMENT_CONSTANTS.ORIGINAL_PATH_HEIGHT * printScale.scaleY;
  
  // Calcular dimensões finais com rotação
  const finalW = Math.abs(scaledW * Math.cos(printScale.rotation * Math.PI / 180)) + Math.abs(scaledH * Math.sin(printScale.rotation * Math.PI / 180));
  const finalH = Math.abs(scaledW * Math.sin(printScale.rotation * Math.PI / 180)) + Math.abs(scaledH * Math.cos(printScale.rotation * Math.PI / 180));
  
  console.log(`📏 VERIFICAÇÃO DE TAMANHO REAL (1:1):`);
  console.log(`   Comprimento real do pé: ${footLength} cm`);
  console.log(`   Comprimento na impressão: ${(scaledH / MEASUREMENT_CONSTANTS.CM_TO_PX_RATIO).toFixed(2)} cm`);
  console.log(`   Tamanho preservado: ${Math.abs(footLength - (scaledH / MEASUREMENT_CONSTANTS.CM_TO_PX_RATIO)) < 0.1 ? '✅ SIM' : '❌ NÃO'}`);
  
  console.log(`📐 VERIFICAÇÃO DE POSICIONAMENTO:`);
  console.log(`   Área útil A4: ${usableW} x ${usableH} px`);
  console.log(`   Palmilha escalada: ${scaledW.toFixed(1)} x ${scaledH.toFixed(1)} px`);
  console.log(`   Palmilha rotacionada: ${finalW.toFixed(1)} x ${finalH.toFixed(1)} px`);
  console.log(`   Ângulo aplicado: ${printScale.rotation.toFixed(2)}°`);
  console.log(`   Cabe na largura: ${finalW <= usableW ? '✅' : '❌'} (${(finalW/usableW*100).toFixed(1)}%)`);
  console.log(`   Cabe na altura: ${finalH <= usableH ? '✅' : '❌'} (${(finalH/usableH*100).toFixed(1)}%)`);
  console.log(`   Centro da folha A4: (${MEASUREMENT_CONSTANTS.A4_WIDTH_PX/2}, ${MEASUREMENT_CONSTANTS.A4_HEIGHT_PX/2})`);
  console.log(`   Centro da palmilha: (95, 350) - mais à esquerda e baixo`);
  
  // Teste especial para tamanho 48 - verificar rotação suave
  if (shoeSize === 48) {
    console.log(`🔥 TAMANHO 48 - ROTAÇÃO SUAVE:`);
    console.log(`   Ângulo por tamanho: ${printScale.angleBySize.toFixed(2)}°`);
    console.log(`   Ângulo mínimo para caber: ${printScale.minAngleToFit.toFixed(2)}°`);
    console.log(`   Ângulo final aplicado: ${printScale.rotation.toFixed(2)}°`);
    console.log(`   Resultado: ${printScale.rotation <= 30 ? '✅ ROTAÇÃO VISÍVEL' : '⚠️ Muito rotacionado'}`);
  }
  
  console.log(`=== Fim do Teste ===`);
};

export const printInsole = async (config: PrintConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (!config.shoeSize || typeof config.shoeSize !== "number") {
        alert("Informe o tamanho do calçado para impressão correta.");
        reject(new Error("Tamanho do calçado não informado"));
        return;
      }
      const w = window.open("", "_blank", "width=900,height=700");
      if (!w) {
        alert("Permita pop-ups para imprimir.");
        reject(new Error("Pop-up bloqueado"));
        return;
      }
      const html = generatePrintContent(config);
      w.document.write(html);
      w.document.close();
      w.onload = () => {
        setTimeout(() => { w.print(); w.close(); resolve(); }, 600);
      };
      w.onerror = () => reject(new Error("Erro ao carregar impressão"));
    } catch (err) {
      reject(err as Error);
    }
  });
};
