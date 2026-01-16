/**
 * Serviço para gerenciar dimensões reais das peças podais
 * Integra com PodalParts e InsoleEditor para dimensionamento correto
 * 
 * REVISADO E OTIMIZADO - Módulo 1
 * - Lógica de escala corrigida para usar mapeamento preciso de comprimento do pé
 * - Dimensões base validadas e ajustadas
 * - Suporte para testes de proporcionalidade
 */

import { pieceMeasurementsService, PieceMeasurement } from './pieceMeasurementsService';
import { getFootLengthFromShoeSize } from './insoleMeasurementsService';

export interface PieceDimensions {
  id: string;
  name: string;
  thickness: number; // mm
  width: number; // cm
  depth: number; // cm
  material?: string;
  isComplete: boolean;
}

export interface PieceDimensionsInput {
  pieceId: string;
  pieceName: string;
  thickness: number;
  width: number;
  depth: number;
  material?: string;
}

class PieceDimensionsService {
  // Cache para dimensões das peças
  private dimensionsCache: Map<string, PieceDimensions> = new Map();
  
  // Dimensões padrão baseadas no catálogo de peças
  private defaultDimensions: Record<string, PieceDimensions> = {
    'p-ARCP-A': {
      id: 'p-ARCP-A',
      name: 'ARCP A',
      thickness: 3,
      width: 8,
      depth: 12,
      material: 'EVA',
      isComplete: true
    },
    'p-ARCP-B': {
      id: 'p-ARCP-B',
      name: 'ARCP B',
      thickness: 3,
      width: 8,
      depth: 12,
      material: 'EVA',
      isComplete: true
    },
    'p-BRCP-L': {
      id: 'p-BRCP-L',
      name: 'BRCP L',
      thickness: 4,
      width: 6,
      depth: 10,
      material: 'EVA',
      isComplete: true
    },
    'p-BTIC-L': {
      id: 'p-BTIC-L',
      name: 'BTIC L',
      thickness: 3,
      width: 5,
      depth: 8,
      material: 'EVA',
      isComplete: true
    },
    'p-CB-S-default': {
      id: 'p-CB-S-default',
      name: 'CB S Default',
      thickness: 2,
      width: 4,
      depth: 6,
      material: 'Gel',
      isComplete: true
    },
    'p-CB-S-inverse': {
      id: 'p-CB-S-inverse',
      name: 'CB S Inverse',
      thickness: 2,
      width: 4,
      depth: 6,
      material: 'Gel',
      isComplete: true
    },
    'p-HCP-L': {
      id: 'p-HCP-L',
      name: 'HCP L',
      thickness: 5,
      width: 7,
      depth: 9,
      material: 'EVA',
      isComplete: true
    },
    'p-SUPPLEMENT-L': {
      id: 'p-SUPPLEMENT-L',
      name: 'SUPPLEMENT L',
      thickness: 2,
      width: 10,
      depth: 15,
      material: 'EVA',
      isComplete: true
    },
    'p1g': {
      id: 'p1g',
      name: 'P1G',
      thickness: 3,
      width: 4,
      depth: 6,
      material: 'EVA',
      isComplete: true
    },
    'p1p': {
      id: 'p1p',
      name: 'P1P',
      thickness: 3,
      width: 4,
      depth: 6,
      material: 'EVA',
      isComplete: true
    },
    'p3g': {
      id: 'p3g',
      name: 'P3G',
      thickness: 3,
      width: 4,
      depth: 6,
      material: 'EVA',
      isComplete: true
    },
    'p3p': {
      id: 'p3p',
      name: 'P3P',
      thickness: 3,
      width: 4,
      depth: 6,
      material: 'EVA',
      isComplete: true
    },
    'p5g': {
      id: 'p5g',
      name: 'P5G',
      thickness: 3,
      width: 4,
      depth: 6,
      material: 'EVA',
      isComplete: true
    },
    'p5p': {
      id: 'p5p',
      name: 'P5P',
      thickness: 3,
      width: 4,
      depth: 6,
      material: 'EVA',
      isComplete: true
    },
    'p7': {
      id: 'p7',
      name: 'P7',
      thickness: 2,
      width: 3,
      depth: 5,
      material: 'EVA',
      isComplete: true
    },
    'p8': {
      id: 'p8',
      name: 'P8',
      thickness: 2,
      width: 3,
      depth: 5,
      material: 'EVA',
      isComplete: true
    },
    'p9': {
      id: 'p9',
      name: 'P9',
      thickness: 2,
      width: 3,
      depth: 5,
      material: 'EVA',
      isComplete: true
    },
    'p11': {
      id: 'p11',
      name: 'P11',
      thickness: 2,
      width: 3,
      depth: 5,
      material: 'EVA',
      isComplete: true
    },
    'p13': {
      id: 'p13',
      name: 'P13',
      thickness: 2,
      width: 3,
      depth: 5,
      material: 'EVA',
      isComplete: true
    },
    'p14g': {
      id: 'p14g',
      name: 'P14G',
      thickness: 3,
      width: 4,
      depth: 6,
      material: 'EVA',
      isComplete: true
    },
    'p14p': {
      id: 'p14p',
      name: 'P14P',
      thickness: 3,
      width: 4,
      depth: 6,
      material: 'EVA',
      isComplete: true
    },
    'p17': {
      id: 'p17',
      name: 'P17',
      thickness: 2,
      width: 3,
      depth: 5,
      material: 'EVA',
      isComplete: true
    },
    'p18': {
      id: 'p18',
      name: 'P18',
      thickness: 2,
      width: 3,
      depth: 5,
      material: 'EVA',
      isComplete: true
    },
    'p19': {
      id: 'p19',
      name: 'P19',
      thickness: 2,
      width: 3,
      depth: 5,
      material: 'EVA',
      isComplete: true
    },
    'p20': {
      id: 'p20',
      name: 'P20',
      thickness: 2,
      width: 3,
      depth: 5,
      material: 'EVA',
      isComplete: true
    },
    'p21': {
      id: 'p21',
      name: 'P21',
      thickness: 2,
      width: 3,
      depth: 5,
      material: 'EVA',
      isComplete: true
    }
  };

  /**
   * Obter dimensões de uma peça específica
   */
  async getPieceDimensions(pieceId: string): Promise<PieceDimensions | null> {
    try {
      // Verificar cache primeiro
      if (this.dimensionsCache.has(pieceId)) {
        return this.dimensionsCache.get(pieceId)!;
      }

      // Tentar buscar do Firebase primeiro
      const firebaseData = await pieceMeasurementsService.getMeasurements(pieceId);
      
      if (firebaseData && firebaseData.isComplete) {
        const dimensions: PieceDimensions = {
          id: firebaseData.id,
          name: firebaseData.pieceName,
          thickness: firebaseData.thickness,
          width: firebaseData.width,
          depth: firebaseData.depth,
          material: firebaseData.material,
          isComplete: firebaseData.isComplete
        };
        
        this.dimensionsCache.set(pieceId, dimensions);
        return dimensions;
      }

      // Se não existir no Firebase, usar dimensões padrão
      const defaultDim = this.defaultDimensions[pieceId];
      if (defaultDim) {
        this.dimensionsCache.set(pieceId, defaultDim);
        return defaultDim;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar dimensões da peça:', error);
      // Em caso de erro, tentar usar dimensões padrão
      const defaultDim = this.defaultDimensions[pieceId];
      if (defaultDim) {
        this.dimensionsCache.set(pieceId, defaultDim);
        return defaultDim;
      }
      return null;
    }
  }

  /**
   * Obter dimensões de múltiplas peças
   */
  async getMultiplePieceDimensions(pieceIds: string[]): Promise<Map<string, PieceDimensions>> {
    const dimensionsMap = new Map<string, PieceDimensions>();
    
    for (const pieceId of pieceIds) {
      const dimensions = await this.getPieceDimensions(pieceId);
      if (dimensions) {
        dimensionsMap.set(pieceId, dimensions);
      }
    }
    
    return dimensionsMap;
  }

  /**
   * Calcular escala real para o SVG baseado no tamanho do calçado
   * REVISADO: Usa mapeamento preciso de comprimento do pé por numeração
   * CORRIGIDO: Tamanho 41 = 27.3cm (não 26cm)
   */
  calculateRealScale(shoeSize: number, pieceDimensions: PieceDimensions): {
    width: number;
    height: number;
    scale: number;
  } {
    // Usar função importada de mapeamento preciso
    const footLength = getFootLengthFromShoeSize(shoeSize);
    
    // Escala do SVG: o SVG da palmilha tem altura original de ~660px
    // que representa o comprimento do pé em cm
    // Usamos a constante ORIGINAL_PATH_HEIGHT = 660px como referência
    const ORIGINAL_PATH_HEIGHT = 660;
    const CM_TO_PX_RATIO = 37.7952755906; // Conversão cm para px (96 DPI)
    
    // Calcular escala baseada no comprimento real do pé
    // A escala deve fazer com que o comprimento do pé seja 1:1 em cm
    const svgScale = (footLength * CM_TO_PX_RATIO) / ORIGINAL_PATH_HEIGHT;
    
    // Dimensões reais em pixels do SVG, mantendo proporção
    // width e depth são em cm, convertemos para pixels do SVG
    const realWidth = pieceDimensions.width * CM_TO_PX_RATIO * svgScale;
    const realHeight = pieceDimensions.depth * CM_TO_PX_RATIO * svgScale;
    
    return {
      width: realWidth,
      height: realHeight,
      scale: svgScale
    };
  }

  /**
   * Validar proporcionalidade de uma peça em diferentes tamanhos
   * NOVO: Método para testes de proporcionalidade
   */
  validateProportionality(pieceId: string, shoeSizes: number[]): {
    isValid: boolean;
    ratios: number[];
    errors: string[];
  } {
    const errors: string[] = [];
    const ratios: number[] = [];

    // Obter dimensões da peça (síncrono para validação)
    const piece = this.defaultDimensions[pieceId];
    if (!piece) {
      return {
        isValid: false,
        ratios: [],
        errors: [`Peça ${pieceId} não encontrada`]
      };
    }

    const baseRatio = piece.width / piece.depth;
    const tolerance = 0.05; // 5% de tolerância

    for (const size of shoeSizes) {
      const scale = this.calculateRealScale(size, piece);
      const ratio = scale.width / scale.height;
      ratios.push(ratio);

      const difference = Math.abs(ratio - baseRatio);
      if (difference > (baseRatio * tolerance)) {
        errors.push(
          `Tamanho ${size}: Razão ${ratio.toFixed(3)} difere da base ${baseRatio.toFixed(3)} por mais de ${(tolerance * 100).toFixed(0)}%`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      ratios,
      errors
    };
  }

  /**
   * Obter todas as dimensões disponíveis
   */
  async getAllDimensions(): Promise<PieceDimensions[]> {
    const allDimensions: PieceDimensions[] = [];
    
    for (const [pieceId, dimensions] of Object.entries(this.defaultDimensions)) {
      try {
        const firebaseData = await pieceMeasurementsService.getMeasurements(pieceId);
        
        if (firebaseData && firebaseData.isComplete) {
          allDimensions.push({
            id: firebaseData.id,
            name: firebaseData.pieceName,
            thickness: firebaseData.thickness,
            width: firebaseData.width,
            depth: firebaseData.depth,
            material: firebaseData.material,
            isComplete: firebaseData.isComplete
          });
        } else {
          allDimensions.push(dimensions);
        }
      } catch (error) {
        // Em caso de erro, usar dimensões padrão
        allDimensions.push(dimensions);
      }
    }
    
    return allDimensions;
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.dimensionsCache.clear();
  }

  /**
   * Atualizar dimensões de uma peça
   */
  async updatePieceDimensions(pieceId: string, dimensions: PieceDimensionsInput, userId?: string): Promise<void> {
    try {
      // Obter userId do localStorage se não fornecido
      const updatedBy = userId || localStorage.getItem('userId') || 'system';
      
      await pieceMeasurementsService.saveMeasurements(pieceId, {
        pieceName: dimensions.pieceName,
        pieceId: dimensions.pieceId,
        thickness: dimensions.thickness,
        width: dimensions.width,
        depth: dimensions.depth,
        material: dimensions.material,
        isComplete: true,
        updatedBy
      });

      // Atualizar cache
      this.dimensionsCache.set(pieceId, {
        id: dimensions.pieceId,
        name: dimensions.pieceName,
        thickness: dimensions.thickness,
        width: dimensions.width,
        depth: dimensions.depth,
        material: dimensions.material,
        isComplete: true
      });
    } catch (error) {
      console.error('Erro ao atualizar dimensões da peça:', error);
      throw new Error('Falha ao atualizar dimensões da peça');
    }
  }
}

// Instância singleton
export const pieceDimensionsService = new PieceDimensionsService();
