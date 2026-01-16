/**
 * Configuração do Modelo de Mapeamento de Tamanhos de Peças
 * Sistema Podostore
 */

import { PieceCategory, PieceSize } from './PieceSizeModel';

export interface PieceSizeModelConfig {
  // Configurações de validação
  validation: {
    minThickness: number;
    maxThickness: number;
    minWidth: number;
    maxWidth: number;
    minDepth: number;
    maxDepth: number;
  };
  
  // Configurações de categorias
  categories: {
    [key in PieceCategory]: {
      name: string;
      description: string;
      defaultThickness?: number;
      defaultWidth?: number;
      defaultDepth?: number;
    };
  };
  
  // Configurações de exportação
  export: {
    csvDelimiter: string;
    includeHeaders: boolean;
    dateFormat: string;
  };
  
  // Configurações de performance
  performance: {
    cacheSize: number;
    enableCaching: boolean;
    searchTimeout: number;
  };
}

export const defaultPieceSizeModelConfig: PieceSizeModelConfig = {
  validation: {
    minThickness: 0.1, // 0.1mm
    maxThickness: 50,  // 50mm
    minWidth: 0.1,     // 0.1cm
    maxWidth: 50,      // 50cm
    minDepth: 0.1,     // 0.1cm
    maxDepth: 50,      // 50cm
  },
  
  categories: {
    [PieceCategory.SAT]: {
      name: 'Suporte de Arco Transverso',
      description: 'Peças para suporte do arco transverso do pé',
      defaultThickness: 3,
      defaultWidth: 5,
      defaultDepth: 8,
    },
    [PieceCategory.SPA]: {
      name: 'Suporte Plantar Anterior',
      description: 'Peças para suporte da região anterior do pé',
      defaultThickness: 10,
      defaultWidth: 6,
      defaultDepth: 13,
    },
    [PieceCategory.SUPLEMENTO_ANTEPE]: {
      name: 'Suplemento de Antepé',
      description: 'Suplementos para a região do antepé',
      defaultThickness: 5,
      defaultWidth: 10,
      defaultDepth: 20,
    },
    [PieceCategory.SUPLEMENTO_INTEIRO]: {
      name: 'Suplemento Inteiro',
      description: 'Suplementos para todo o pé',
      defaultThickness: 5,
      defaultWidth: 9,
      defaultDepth: 28,
    },
    [PieceCategory.TL]: {
      name: 'Talonete',
      description: 'Peças para suporte do calcanhar',
      defaultThickness: 5,
      defaultWidth: 8,
      defaultDepth: 12,
    },
    [PieceCategory.PALMILHA_HITECH]: {
      name: 'Palmilha Hi-tech',
      description: 'Palmilhas de alta tecnologia',
      defaultThickness: 3,
      defaultWidth: 9,
      defaultDepth: 6,
    },
    [PieceCategory.SAC]: {
      name: 'Suporte de Arco Cavo',
      description: 'Peças para suporte do arco cavo',
      defaultThickness: 20,
      defaultWidth: 6,
      defaultDepth: 17,
    },
    [PieceCategory.SAE]: {
      name: 'Suporte de Arco Equino',
      description: 'Peças para suporte do arco equino',
      defaultThickness: 25,
      defaultWidth: 7,
      defaultDepth: 12,
    },
    [PieceCategory.ARCP]: {
      name: 'Arco Plantar',
      description: 'Peças para suporte do arco plantar',
      defaultThickness: 10,
      defaultWidth: 6,
      defaultDepth: 18,
    },
    [PieceCategory.RC]: {
      name: 'Retrocalcâneo',
      description: 'Peças para suporte do retrocalcâneo',
      defaultThickness: 2,
      defaultWidth: 9,
      defaultDepth: 5,
    },
    [PieceCategory.HCP]: {
      name: 'Suporte de Calcanhar',
      description: 'Peças para suporte do calcanhar',
      defaultThickness: 3,
      defaultWidth: 8,
      defaultDepth: 5,
    },
    [PieceCategory.BTIC]: {
      name: 'Barreta Transversal Interna do Calcanhar',
      description: 'Barretas para suporte interno do calcanhar',
      defaultThickness: 5,
      defaultWidth: 2,
      defaultDepth: 5,
    },
    [PieceCategory.BTP]: {
      name: 'Barreta Transversal Plantar',
      description: 'Barretas para suporte plantar',
      defaultThickness: 2,
      defaultWidth: 3,
      defaultDepth: 3,
    },
    [PieceCategory.BIC]: {
      name: 'Barreta Interna do Calcanhar',
      description: 'Barretas para suporte interno do calcanhar',
      defaultThickness: 2,
      defaultWidth: 4,
      defaultDepth: 11,
    },
    [PieceCategory.BRC]: {
      name: 'Barreta Retrocalcânea',
      description: 'Barretas para suporte retrocalcâneo',
      defaultThickness: 2,
      defaultWidth: 5,
      defaultDepth: 10,
    },
    [PieceCategory.BRCP]: {
      name: 'Barreta Retrocalcânea Plantar',
      description: 'Barretas para suporte retrocalcâneo plantar',
      defaultThickness: 5,
      defaultWidth: 11,
      defaultDepth: 15,
    },
    [PieceCategory.BC]: {
      name: 'Barreta de Calcanhar',
      description: 'Barretas para suporte do calcanhar',
      defaultThickness: 2,
      defaultWidth: 3,
      defaultDepth: 10,
    },
    [PieceCategory.CB]: {
      name: 'Cuneiforme Bilateral',
      description: 'Cuneiformes para suporte bilateral',
      defaultThickness: 12,
      defaultWidth: 7,
      defaultDepth: 11,
    },
    [PieceCategory.CC]: {
      name: 'Cuneiforme Central',
      description: 'Cuneiformes para suporte central',
      defaultThickness: 5,
      defaultWidth: 7,
      defaultDepth: 12,
    },
    [PieceCategory.EAE]: {
      name: 'Elevador de Antepé Equino',
      description: 'Elevadores para antepé equino',
      defaultThickness: 20,
      defaultWidth: 8,
      defaultDepth: 18,
    },
    [PieceCategory.EC]: {
      name: 'Elevador de Calcanhar',
      description: 'Elevadores para calcanhar',
      defaultThickness: 8,
      defaultWidth: 7,
      defaultDepth: 11,
    },
    [PieceCategory.AMORTECEDOR_ABS]: {
      name: 'Amortecedor ABS',
      description: 'Amortecedores de material ABS',
      defaultThickness: 5,
      defaultWidth: 5,
      defaultDepth: 5,
    },
  },
  
  export: {
    csvDelimiter: ';',
    includeHeaders: true,
    dateFormat: 'dd/MM/yyyy',
  },
  
  performance: {
    cacheSize: 1000,
    enableCaching: true,
    searchTimeout: 5000, // 5 segundos
  },
};

export class PieceSizeModelConfigManager {
  private config: PieceSizeModelConfig;
  
  constructor(config: PieceSizeModelConfig = defaultPieceSizeModelConfig) {
    this.config = { ...config };
  }
  
  /**
   * Obter configuração atual
   */
  public getConfig(): PieceSizeModelConfig {
    return { ...this.config };
  }
  
  /**
   * Atualizar configuração
   */
  public updateConfig(updates: Partial<PieceSizeModelConfig>): void {
    this.config = { ...this.config, ...updates };
  }
  
  /**
   * Obter configuração de validação
   */
  public getValidationConfig() {
    return this.config.validation;
  }
  
  /**
   * Obter configuração de categoria
   */
  public getCategoryConfig(category: PieceCategory) {
    return this.config.categories[category];
  }
  
  /**
   * Obter configuração de exportação
   */
  public getExportConfig() {
    return this.config.export;
  }
  
  /**
   * Obter configuração de performance
   */
  public getPerformanceConfig() {
    return this.config.performance;
  }
  
  /**
   * Validar dimensões baseado na configuração
   */
  public validateDimensions(dimensions: { thickness: number; width: number; depth: number }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const { minThickness, maxThickness, minWidth, maxWidth, minDepth, maxDepth } = this.config.validation;
    
    if (dimensions.thickness < minThickness || dimensions.thickness > maxThickness) {
      errors.push(`Espessura deve estar entre ${minThickness}mm e ${maxThickness}mm`);
    }
    
    if (dimensions.width < minWidth || dimensions.width > maxWidth) {
      errors.push(`Largura deve estar entre ${minWidth}cm e ${maxWidth}cm`);
    }
    
    if (dimensions.depth < minDepth || dimensions.depth > maxDepth) {
      errors.push(`Profundidade deve estar entre ${minDepth}cm e ${maxDepth}cm`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Obter dimensões padrão para uma categoria
   */
  public getDefaultDimensions(category: PieceCategory): { thickness: number; width: number; depth: number } | null {
    const categoryConfig = this.config.categories[category];
    
    if (categoryConfig.defaultThickness && categoryConfig.defaultWidth && categoryConfig.defaultDepth) {
      return {
        thickness: categoryConfig.defaultThickness,
        width: categoryConfig.defaultWidth,
        depth: categoryConfig.defaultDepth,
      };
    }
    
    return null;
  }
  
  /**
   * Obter todas as categorias com suas configurações
   */
  public getAllCategories(): Array<{ category: PieceCategory; config: any }> {
    return Object.entries(this.config.categories).map(([category, config]) => ({
      category: category as PieceCategory,
      config,
    }));
  }
  
  /**
   * Exportar configuração para JSON
   */
  public exportToJSON(): string {
    return JSON.stringify(this.config, null, 2);
  }
  
  /**
   * Importar configuração de JSON
   */
  public importFromJSON(json: string): void {
    try {
      const importedConfig = JSON.parse(json);
      this.config = { ...defaultPieceSizeModelConfig, ...importedConfig };
    } catch (error) {
      throw new Error('Erro ao importar configuração: JSON inválido');
    }
  }
  
  /**
   * Resetar para configuração padrão
   */
  public resetToDefault(): void {
    this.config = { ...defaultPieceSizeModelConfig };
  }
}

// Instância singleton para uso global
export const pieceSizeModelConfig = new PieceSizeModelConfigManager();
