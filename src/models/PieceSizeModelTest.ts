/**
 * Teste do Modelo de Mapeamento de Tamanhos de Peças
 * Sistema Podostore
 */

import { pieceSizeModel, PieceCategory, PieceSize } from './PieceSizeModel';

export class PieceSizeModelTest {
  
  /**
   * Teste básico de funcionalidades
   */
  public static runBasicTests(): boolean {
    console.log('🧪 Executando testes básicos...');
    
    let testsPassed = 0;
    let totalTests = 0;
    
    // Teste 1: Verificar se o modelo foi inicializado
    totalTests++;
    const allPieces = pieceSizeModel.getAllPieces();
    if (allPieces.length > 0) {
      console.log('✅ Teste 1: Modelo inicializado com sucesso');
      testsPassed++;
    } else {
      console.log('❌ Teste 1: Modelo não foi inicializado');
    }
    
    // Teste 2: Verificar se uma peça específica existe
    totalTests++;
    const piece = pieceSizeModel.getPiece('SAT_G_ZI_ESQUERDO');
    if (piece && piece.name === 'SAT G ZI esquerdo') {
      console.log('✅ Teste 2: Peça específica encontrada');
      testsPassed++;
    } else {
      console.log('❌ Teste 2: Peça específica não encontrada');
    }
    
    // Teste 3: Verificar busca por categoria
    totalTests++;
    const satPieces = pieceSizeModel.getPiecesByCategory(PieceCategory.SAT);
    if (satPieces.length > 0) {
      console.log('✅ Teste 3: Busca por categoria funcionando');
      testsPassed++;
    } else {
      console.log('❌ Teste 3: Busca por categoria falhou');
    }
    
    // Teste 4: Verificar busca por lado
    totalTests++;
    const leftPieces = pieceSizeModel.getPiecesBySide('esquerdo');
    if (leftPieces.length > 0) {
      console.log('✅ Teste 4: Busca por lado funcionando');
      testsPassed++;
    } else {
      console.log('❌ Teste 4: Busca por lado falhou');
    }
    
    // Teste 5: Verificar busca por tamanho
    totalTests++;
    const smallPieces = pieceSizeModel.getPiecesBySize('P');
    if (smallPieces.length > 0) {
      console.log('✅ Teste 5: Busca por tamanho funcionando');
      testsPassed++;
    } else {
      console.log('❌ Teste 5: Busca por tamanho falhou');
    }
    
    // Teste 6: Verificar identificação de peças incompletas
    totalTests++;
    const incompletePieces = pieceSizeModel.getIncompletePieces();
    if (incompletePieces.length > 0) {
      console.log('✅ Teste 6: Identificação de peças incompletas funcionando');
      testsPassed++;
    } else {
      console.log('❌ Teste 6: Identificação de peças incompletas falhou');
    }
    
    // Teste 7: Verificar estatísticas
    totalTests++;
    const stats = pieceSizeModel.getStatistics();
    if (stats.total > 0 && stats.completionRate >= 0) {
      console.log('✅ Teste 7: Cálculo de estatísticas funcionando');
      testsPassed++;
    } else {
      console.log('❌ Teste 7: Cálculo de estatísticas falhou');
    }
    
    // Teste 8: Verificar exportação CSV
    totalTests++;
    const csvData = pieceSizeModel.exportToCSV();
    if (csvData && csvData.includes('ID') && csvData.includes('Nome')) {
      console.log('✅ Teste 8: Exportação CSV funcionando');
      testsPassed++;
    } else {
      console.log('❌ Teste 8: Exportação CSV falhou');
    }
    
    // Teste 9: Verificar validação de dimensões
    totalTests++;
    const testPiece = pieceSizeModel.getPiece('SAT_G_ZI_ESQUERDO');
    if (testPiece) {
      const validation = pieceSizeModel.validateDimensions(testPiece);
      if (validation.isValid) {
        console.log('✅ Teste 9: Validação de dimensões funcionando');
        testsPassed++;
      } else {
        console.log('❌ Teste 9: Validação de dimensões falhou');
      }
    } else {
      console.log('❌ Teste 9: Peça para teste não encontrada');
    }
    
    // Teste 10: Verificar busca por texto
    totalTests++;
    const searchResults = pieceSizeModel.searchPieces('SAT');
    if (searchResults.length > 0) {
      console.log('✅ Teste 10: Busca por texto funcionando');
      testsPassed++;
    } else {
      console.log('❌ Teste 10: Busca por texto falhou');
    }
    
    console.log(`\n📊 Resultado dos testes: ${testsPassed}/${totalTests} passaram`);
    return testsPassed === totalTests;
  }
  
  /**
   * Teste de dados específicos
   */
  public static runDataTests(): boolean {
    console.log('\n🧪 Executando testes de dados...');
    
    let testsPassed = 0;
    let totalTests = 0;
    
    // Teste 1: Verificar se todas as peças SAT estão presentes
    totalTests++;
    const expectedSatPieces = [
      'SAT_G_ZI_ESQUERDO',
      'SAT_P_DIREITO',
      'SAT_P_ESQUERDO',
      'SAT_P_ZI_DIREITO',
      'SAT_P_ZI_ESQUERDO',
      'SAT_G_DIREITO',
      'SAT_G_ESQUERDO',
      'SAT_G_ZI_DIREITO'
    ];
    
    const satPieces = pieceSizeModel.getPiecesByCategory(PieceCategory.SAT);
    const satIds = satPieces.map(p => p.id);
    const allSatPresent = expectedSatPieces.every(id => satIds.includes(id));
    
    if (allSatPresent) {
      console.log('✅ Teste 1: Todas as peças SAT estão presentes');
      testsPassed++;
    } else {
      console.log('❌ Teste 1: Algumas peças SAT estão faltando');
    }
    
    // Teste 2: Verificar dimensões de uma peça específica
    totalTests++;
    const piece = pieceSizeModel.getPiece('SAT_G_ZI_ESQUERDO');
    if (piece && piece.dimensions.thickness === 3 && piece.dimensions.width === 5 && piece.dimensions.depth === 8) {
      console.log('✅ Teste 2: Dimensões da peça SAT_G_ZI_ESQUERDO estão corretas');
      testsPassed++;
    } else {
      console.log('❌ Teste 2: Dimensões da peça SAT_G_ZI_ESQUERDO estão incorretas');
    }
    
    // Teste 3: Verificar se há peças incompletas
    totalTests++;
    const incompletePieces = pieceSizeModel.getIncompletePieces();
    const expectedIncomplete = [
      'PALMILHA_HITECH_G_ESQUERDO',
      'PALMILHA_HITECH_P_DIREITO',
      'PALMILHA_HITECH_P_ESQUERDO',
      'SAC_DIREITO_P',
      'SAC_ESQUERDO_P'
    ];
    
    const incompleteIds = incompletePieces.map(p => p.id);
    const allIncompletePresent = expectedIncomplete.every(id => incompleteIds.includes(id));
    
    if (allIncompletePresent) {
      console.log('✅ Teste 3: Peças incompletas identificadas corretamente');
      testsPassed++;
    } else {
      console.log('❌ Teste 3: Peças incompletas não identificadas corretamente');
    }
    
    // Teste 4: Verificar distribuição por tamanho
    totalTests++;
    const stats = pieceSizeModel.getStatistics();
    if (stats.sizeStats.P > 0 && stats.sizeStats.G > 0) {
      console.log('✅ Teste 4: Distribuição por tamanho está correta');
      testsPassed++;
    } else {
      console.log('❌ Teste 4: Distribuição por tamanho está incorreta');
    }
    
    // Teste 5: Verificar distribuição por lado
    totalTests++;
    if (stats.sideStats.direito > 0 && stats.sideStats.esquerdo > 0) {
      console.log('✅ Teste 5: Distribuição por lado está correta');
      testsPassed++;
    } else {
      console.log('❌ Teste 5: Distribuição por lado está incorreta');
    }
    
    console.log(`\n📊 Resultado dos testes de dados: ${testsPassed}/${totalTests} passaram`);
    return testsPassed === totalTests;
  }
  
  /**
   * Teste de performance
   */
  public static runPerformanceTests(): boolean {
    console.log('\n🧪 Executando testes de performance...');
    
    let testsPassed = 0;
    let totalTests = 0;
    
    // Teste 1: Performance de busca por categoria
    totalTests++;
    const startTime1 = Date.now();
    for (let i = 0; i < 1000; i++) {
      pieceSizeModel.getPiecesByCategory(PieceCategory.SAT);
    }
    const endTime1 = Date.now();
    const duration1 = endTime1 - startTime1;
    
    if (duration1 < 100) { // Menos de 100ms para 1000 operações
      console.log(`✅ Teste 1: Performance de busca por categoria OK (${duration1}ms)`);
      testsPassed++;
    } else {
      console.log(`❌ Teste 1: Performance de busca por categoria lenta (${duration1}ms)`);
    }
    
    // Teste 2: Performance de busca por texto
    totalTests++;
    const startTime2 = Date.now();
    for (let i = 0; i < 1000; i++) {
      pieceSizeModel.searchPieces('SAT');
    }
    const endTime2 = Date.now();
    const duration2 = endTime2 - startTime2;
    
    if (duration2 < 200) { // Menos de 200ms para 1000 operações
      console.log(`✅ Teste 2: Performance de busca por texto OK (${duration2}ms)`);
      testsPassed++;
    } else {
      console.log(`❌ Teste 2: Performance de busca por texto lenta (${duration2}ms)`);
    }
    
    // Teste 3: Performance de cálculo de estatísticas
    totalTests++;
    const startTime3 = Date.now();
    for (let i = 0; i < 100; i++) {
      pieceSizeModel.getStatistics();
    }
    const endTime3 = Date.now();
    const duration3 = endTime3 - startTime3;
    
    if (duration3 < 100) { // Menos de 100ms para 100 operações
      console.log(`✅ Teste 3: Performance de cálculo de estatísticas OK (${duration3}ms)`);
      testsPassed++;
    } else {
      console.log(`❌ Teste 3: Performance de cálculo de estatísticas lenta (${duration3}ms)`);
    }
    
    console.log(`\n📊 Resultado dos testes de performance: ${testsPassed}/${totalTests} passaram`);
    return testsPassed === totalTests;
  }
  
  /**
   * Executar todos os testes
   */
  public static runAllTests(): boolean {
    console.log('🚀 INICIANDO TESTES DO MODELO DE MAPEAMENTO DE PEÇAS');
    console.log('==================================================');
    
    const basicTestsPassed = this.runBasicTests();
    const dataTestsPassed = this.runDataTests();
    const performanceTestsPassed = this.runPerformanceTests();
    
    const allTestsPassed = basicTestsPassed && dataTestsPassed && performanceTestsPassed;
    
    console.log('\n🎯 RESULTADO FINAL DOS TESTES');
    console.log('============================');
    console.log(`Testes básicos: ${basicTestsPassed ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`Testes de dados: ${dataTestsPassed ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`Testes de performance: ${performanceTestsPassed ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`\nResultado geral: ${allTestsPassed ? '✅ TODOS OS TESTES PASSARAM' : '❌ ALGUNS TESTES FALHARAM'}`);
    
    return allTestsPassed;
  }
  
  /**
   * Demonstrar funcionalidades do modelo
   */
  public static demonstrateFeatures(): void {
    console.log('\n🎯 DEMONSTRAÇÃO DAS FUNCIONALIDADES');
    console.log('==================================');
    
    // Demonstrar busca por categoria
    console.log('\n📋 Peças SAT (Suportes de Arco Transverso):');
    const satPieces = pieceSizeModel.getPiecesByCategory(PieceCategory.SAT);
    satPieces.forEach(piece => {
      console.log(`- ${piece.name}: ${piece.dimensions.thickness}mm x ${piece.dimensions.width}cm x ${piece.dimensions.depth}cm`);
    });
    
    // Demonstrar peças incompletas
    console.log('\n⚠️ Peças que precisam de atenção:');
    const incompletePieces = pieceSizeModel.getIncompletePieces();
    incompletePieces.forEach(piece => {
      console.log(`- ${piece.name}: ${piece.notes || 'Dados faltando'}`);
    });
    
    // Demonstrar estatísticas
    console.log('\n📊 Estatísticas gerais:');
    const stats = pieceSizeModel.getStatistics();
    console.log(`- Total de peças: ${stats.total}`);
    console.log(`- Taxa de completude: ${stats.completionRate.toFixed(2)}%`);
    console.log(`- Peças por categoria: ${Object.keys(stats.categoryStats).length}`);
    
    // Demonstrar busca por texto
    console.log('\n🔍 Resultados da busca por "BIC":');
    const searchResults = pieceSizeModel.searchPieces('BIC');
    searchResults.forEach(piece => {
      console.log(`- ${piece.name} (${piece.category})`);
    });
  }
}

// Executar testes se o arquivo for executado diretamente
if (require.main === module) {
  const testsPassed = PieceSizeModelTest.runAllTests();
  PieceSizeModelTest.demonstrateFeatures();
  
  if (testsPassed) {
    console.log('\n🎉 Modelo está funcionando perfeitamente!');
  } else {
    console.log('\n⚠️ Modelo precisa de ajustes.');
  }
}
