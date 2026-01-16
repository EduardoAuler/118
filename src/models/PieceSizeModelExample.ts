/**
 * Exemplo de Uso do Modelo de Mapeamento de Tamanhos de Peças
 * Sistema Podostore
 */

import { pieceSizeModel, PieceCategory, PieceSize } from './PieceSizeModel';

export class PieceSizeModelExample {
  
  /**
   * Exemplo 1: Consultas básicas
   */
  public static basicQueries(): void {
    console.log('=== CONSULTAS BÁSICAS ===');
    
    // Buscar uma peça específica
    const piece = pieceSizeModel.getPiece('SAT_G_ZI_ESQUERDO');
    if (piece) {
      console.log('Peça encontrada:', piece.name);
      console.log('Dimensões:', piece.dimensions);
    }
    
    // Buscar todas as peças
    const allPieces = pieceSizeModel.getAllPieces();
    console.log(`Total de peças cadastradas: ${allPieces.length}`);
    
    // Buscar por categoria
    const satPieces = pieceSizeModel.getPiecesByCategory(PieceCategory.SAT);
    console.log(`Peças SAT: ${satPieces.length}`);
    
    // Buscar por lado
    const leftPieces = pieceSizeModel.getPiecesBySide('esquerdo');
    const rightPieces = pieceSizeModel.getPiecesBySide('direito');
    console.log(`Peças esquerdas: ${leftPieces.length}`);
    console.log(`Peças direitas: ${rightPieces.length}`);
    
    // Buscar por tamanho
    const smallPieces = pieceSizeModel.getPiecesBySize('P');
    const mediumPieces = pieceSizeModel.getPiecesBySize('M');
    const largePieces = pieceSizeModel.getPiecesBySize('G');
    console.log(`Peças pequenas (P): ${smallPieces.length}`);
    console.log(`Peças médias (M): ${mediumPieces.length}`);
    console.log(`Peças grandes (G): ${largePieces.length}`);
  }
  
  /**
   * Exemplo 2: Análise de dados incompletos
   */
  public static analyzeIncompleteData(): void {
    console.log('\n=== ANÁLISE DE DADOS INCOMPLETOS ===');
    
    const incompletePieces = pieceSizeModel.getIncompletePieces();
    console.log(`Peças com dados incompletos: ${incompletePieces.length}`);
    
    incompletePieces.forEach(piece => {
      console.log(`- ${piece.name}`);
      if (piece.notes) {
        console.log(`  Nota: ${piece.notes}`);
      }
      console.log(`  Dimensões: ${piece.dimensions.thickness}mm x ${piece.dimensions.width}cm x ${piece.dimensions.depth}cm`);
    });
  }
  
  /**
   * Exemplo 3: Estatísticas detalhadas
   */
  public static detailedStatistics(): void {
    console.log('\n=== ESTATÍSTICAS DETALHADAS ===');
    
    const stats = pieceSizeModel.getStatistics();
    
    console.log('Resumo Geral:');
    console.log(`- Total de peças: ${stats.total}`);
    console.log(`- Peças completas: ${stats.complete}`);
    console.log(`- Peças incompletas: ${stats.incomplete}`);
    console.log(`- Taxa de completude: ${stats.completionRate.toFixed(2)}%`);
    
    console.log('\nPor Categoria:');
    Object.entries(stats.categoryStats).forEach(([category, count]) => {
      console.log(`- ${category}: ${count} peças`);
    });
    
    console.log('\nPor Lado:');
    Object.entries(stats.sideStats).forEach(([side, count]) => {
      console.log(`- ${side}: ${count} peças`);
    });
    
    console.log('\nPor Tamanho:');
    Object.entries(stats.sizeStats).forEach(([size, count]) => {
      console.log(`- ${size}: ${count} peças`);
    });
  }
  
  /**
   * Exemplo 4: Busca e filtros
   */
  public static searchAndFilters(): void {
    console.log('\n=== BUSCA E FILTROS ===');
    
    // Busca por texto
    const searchResults = pieceSizeModel.searchPieces('SAT');
    console.log(`Resultados para "SAT": ${searchResults.length}`);
    searchResults.forEach(piece => {
      console.log(`- ${piece.name} (${piece.category})`);
    });
    
    // Busca por material
    const allPieces = pieceSizeModel.getAllPieces();
    const puPieces = allPieces.filter(piece => piece.material === 'PU');
    const gelPieces = allPieces.filter(piece => piece.material === 'Gel');
    
    console.log(`\nPeças de material PU: ${puPieces.length}`);
    console.log(`Peças de material Gel: ${gelPieces.length}`);
  }
  
  /**
   * Exemplo 5: Validação de dimensões
   */
  public static validateDimensions(): void {
    console.log('\n=== VALIDAÇÃO DE DIMENSÕES ===');
    
    const allPieces = pieceSizeModel.getAllPieces();
    let validPieces = 0;
    let invalidPieces = 0;
    
    allPieces.forEach(piece => {
      const validation = pieceSizeModel.validateDimensions(piece);
      if (validation.isValid) {
        validPieces++;
      } else {
        invalidPieces++;
        console.log(`Peça inválida: ${piece.name}`);
        validation.errors.forEach(error => {
          console.log(`  - ${error}`);
        });
      }
    });
    
    console.log(`Peças válidas: ${validPieces}`);
    console.log(`Peças inválidas: ${invalidPieces}`);
  }
  
  /**
   * Exemplo 6: Análise por categoria específica
   */
  public static analyzeByCategory(category: PieceCategory): void {
    console.log(`\n=== ANÁLISE DA CATEGORIA ${category} ===`);
    
    const pieces = pieceSizeModel.getPiecesByCategory(category);
    console.log(`Total de peças: ${pieces.length}`);
    
    if (pieces.length > 0) {
      // Análise de dimensões
      const thicknesses = pieces.map(p => p.dimensions.thickness).filter(t => t > 0);
      const widths = pieces.map(p => p.dimensions.width).filter(w => w > 0);
      const depths = pieces.map(p => p.dimensions.depth).filter(d => d > 0);
      
      if (thicknesses.length > 0) {
        console.log(`Espessura - Min: ${Math.min(...thicknesses)}mm, Max: ${Math.max(...thicknesses)}mm`);
      }
      if (widths.length > 0) {
        console.log(`Largura - Min: ${Math.min(...widths)}cm, Max: ${Math.max(...widths)}cm`);
      }
      if (depths.length > 0) {
        console.log(`Profundidade - Min: ${Math.min(...depths)}cm, Max: ${Math.max(...depths)}cm`);
      }
      
      // Análise por lado
      const leftPieces = pieces.filter(p => p.side === 'esquerdo');
      const rightPieces = pieces.filter(p => p.side === 'direito');
      console.log(`Peças esquerdas: ${leftPieces.length}`);
      console.log(`Peças direitas: ${rightPieces.length}`);
      
      // Análise por tamanho
      const smallPieces = pieces.filter(p => p.size === 'P');
      const mediumPieces = pieces.filter(p => p.size === 'M');
      const largePieces = pieces.filter(p => p.size === 'G');
      console.log(`Peças pequenas: ${smallPieces.length}`);
      console.log(`Peças médias: ${mediumPieces.length}`);
      console.log(`Peças grandes: ${largePieces.length}`);
    }
  }
  
  /**
   * Exemplo 7: Exportação de dados
   */
  public static exportData(): void {
    console.log('\n=== EXPORTAÇÃO DE DADOS ===');
    
    // Exportar para CSV
    const csvData = pieceSizeModel.exportToCSV();
    console.log('Dados exportados para CSV:');
    console.log(csvData.substring(0, 500) + '...'); // Mostrar apenas os primeiros 500 caracteres
    
    // Exportar peças incompletas
    const incompletePieces = pieceSizeModel.getIncompletePieces();
    console.log(`\nPeças incompletas para revisão: ${incompletePieces.length}`);
    incompletePieces.forEach(piece => {
      console.log(`- ${piece.name}: ${piece.notes || 'Dados faltando'}`);
    });
  }
  
  /**
   * Exemplo 8: Relatório completo
   */
  public static generateCompleteReport(): void {
    console.log('\n=== RELATÓRIO COMPLETO ===');
    
    const stats = pieceSizeModel.getStatistics();
    const incompletePieces = pieceSizeModel.getIncompletePieces();
    
    console.log('RELATÓRIO DE MAPEAMENTO DE PEÇAS - PODOSTORE');
    console.log('============================================');
    console.log(`Data: ${new Date().toLocaleDateString('pt-BR')}`);
    console.log(`Total de peças: ${stats.total}`);
    console.log(`Taxa de completude: ${stats.completionRate.toFixed(2)}%`);
    
    console.log('\nCATEGORIAS COM MAIS PEÇAS:');
    const sortedCategories = Object.entries(stats.categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    sortedCategories.forEach(([category, count]) => {
      console.log(`- ${category}: ${count} peças`);
    });
    
    console.log('\nPEÇAS QUE PRECISAM DE ATENÇÃO:');
    incompletePieces.forEach(piece => {
      console.log(`- ${piece.name} (${piece.category})`);
      if (piece.notes) {
        console.log(`  ${piece.notes}`);
      }
    });
    
    console.log('\nDISTRIBUIÇÃO POR TAMANHO:');
    Object.entries(stats.sizeStats).forEach(([size, count]) => {
      const percentage = (count / stats.total) * 100;
      console.log(`- ${size}: ${count} peças (${percentage.toFixed(1)}%)`);
    });
  }
  
  /**
   * Executar todos os exemplos
   */
  public static runAllExamples(): void {
    this.basicQueries();
    this.analyzeIncompleteData();
    this.detailedStatistics();
    this.searchAndFilters();
    this.validateDimensions();
    this.analyzeByCategory(PieceCategory.SAT);
    this.exportData();
    this.generateCompleteReport();
  }
}

// Exemplo de uso
if (require.main === module) {
  console.log('EXEMPLOS DE USO DO MODELO DE MAPEAMENTO DE PEÇAS');
  console.log('================================================');
  
  PieceSizeModelExample.runAllExamples();
}
