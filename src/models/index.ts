/**
 * Índice do Modelo de Mapeamento de Tamanhos de Peças
 * Sistema Podostore
 */

// Exportar o modelo principal
export { 
  pieceSizeModel, 
  PieceSizeModel
} from './PieceSizeModel';

// Exportar tipos do modelo principal
export type { 
  PieceSize, 
  PieceDimensions
} from './PieceSizeModel';

// Exportar enum como valor para uso em runtime
export { PieceCategory } from './PieceSizeModel';

// Exportar configurações
export { 
  pieceSizeModelConfig, 
  PieceSizeModelConfigManager, 
  defaultPieceSizeModelConfig 
} from './PieceSizeModelConfig';

// Exportar tipos de configuração
export type { 
  PieceSizeModelConfig 
} from './PieceSizeModelConfig';

// Exportar exemplos e testes
export { PieceSizeModelExample } from './PieceSizeModelExample';
export { PieceSizeModelTest } from './PieceSizeModelTest';

// Re-exportar tipos para conveniência
export type {
  PieceSize as IPieceSize,
  PieceDimensions as IPieceDimensions,
  PieceCategory as IPieceCategory
} from './PieceSizeModel';

export type {
  PieceSizeModelConfig as IPieceSizeModelConfig
} from './PieceSizeModelConfig';
